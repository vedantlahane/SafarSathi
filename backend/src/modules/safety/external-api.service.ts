import axios from 'axios';
import { env } from '../../shared/config/env.js';
import { logger } from '../../shared/logger/index.js';

export interface MlBaselinePayload {
  status?: string;
  ml_baseline?: {
    status: string;
    predicted_score: number;
    shap_base_value: number;
    shap_values: Record<string, number>;
  } | null;
  infrastructure?: Record<string, unknown> | null;
  spatial_context?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface LiveAqiPayload {
  [key: string]: unknown;
}

export interface ImdWarningPayload {
  District?: string;
  district?: string;
  Day1_Color?: string;
  Day_1?: string;
  [key: string]: unknown;
}

export interface ImdNowcastPayload {
  Station?: string;
  message?: string;
  color?: string;
  [key: string]: unknown;
}

// ==========================================
// IMD OAUTH TOKEN MANAGER
// ==========================================
let imdJwtToken: string | null = null;
let imdTokenExpiresAt: number = 0;

async function getImdHeaders(): Promise<Record<string, string>> {
  const now = Date.now();
  
  // If token is missing or expires in less than 5 minutes, fetch a new one
  if (!imdJwtToken || now > imdTokenExpiresAt - 300000) {
    try {
      logger.info('Requesting fresh JWT token from IMD OAuth...');
      const response = await axios.post('https://api.imd.gov.in/api/oauth/token.php', {
        email: env.IMD_EMAIL,
        password: env.IMD_PASSWORD
      });

      imdJwtToken = response.data.access_token;
      // expires_in is in seconds. Convert to milliseconds.
      imdTokenExpiresAt = now + (response.data.expires_in * 1000); 
      logger.info('Successfully acquired IMD JWT token.');
      
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error) ? error.message : (error as Error).message;
      logger.error({ err: msg }, 'Failed to authenticate with IMD OAuth. Check credentials.');
      throw new Error('IMD Auth Failed');
    }
  }

  return {
    'X-API-KEY': env.IMD_API_KEY,
    'Authorization': `Bearer ${imdJwtToken}`
  };
}

// ==========================================
// EXTERNAL API FETCHERS
// ==========================================
export const externalApiService = {
  async fetchMlBaseline(lat: number, lon: number, localHour: number): Promise<MlBaselinePayload> {
    try {
      const response = await axios.post<MlBaselinePayload>(
        `${env.ML_API_URL}/safety/evaluate`,
        {
          lat: Number.parseFloat(String(lat)),
          lon: Number.parseFloat(String(lon)),
          local_hour: Number.parseInt(String(localHour), 10),
        },
        { timeout: 3000 },
      );
      return response.data;
    } catch (error) {
      logger.warn('Python ML Engine Failed or Offline.');
      return { status: 'OFFLINE', ml_baseline: null, infrastructure: null };
    }
  },

  async fetchLiveAqi(lat: number, lon: number): Promise<Record<string, unknown>> {
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone`;
      const response = await axios.get(url, { timeout: 3000 });
      return (response.data as { current?: LiveAqiPayload } | undefined)?.current ?? {};
    } catch (error) {
      logger.warn('Open-Meteo API Failed');
      return {};
    }
  },

  async fetchLiveImdWarning(districtName: string | undefined): Promise<ImdWarningPayload | null> {
    if (!districtName || districtName === 'Unknown') return null;

    try {
      const headers = await getImdHeaders();
      const response = await axios.get<ImdWarningPayload[] | { data?: ImdWarningPayload[] }>(
        'https://api.imd.gov.in/api/v1/districtwarning',
        { headers, timeout: 4000 }
      );

      const warnings = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as { data?: ImdWarningPayload[] } | undefined)?.data)
          ? ((response.data as { data?: ImdWarningPayload[] }).data ?? [])
          : [];

      return warnings.find((entry: ImdWarningPayload) => {
        const district = String(entry.District ?? entry.district ?? '').trim().toLowerCase();
        return district === districtName.trim().toLowerCase();
      }) ?? null;
    } catch (error: any) {
      const msg = error?.response?.status 
        ? `Status ${error.response.status} - ${error.message}` 
        : error.message;
      logger.warn({ err: msg }, 'IMD District Warning API Failed');
      return null;
    }
  },

  async fetchLiveImdNowcast(districtName: string | undefined): Promise<ImdNowcastPayload | null> {
    if (!districtName || districtName === 'Unknown') return null;

    try {
      const headers = await getImdHeaders();
      const response = await axios.get<ImdNowcastPayload[] | { data?: ImdNowcastPayload[] }>(
        'https://api.imd.gov.in/api/v1/districtnowcast',
        { headers, timeout: 4000 }
      );

      const nowcasts = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as { data?: ImdNowcastPayload[] }).data)
          ? ((response.data as { data?: ImdNowcastPayload[] }).data ?? [])
          : [];

      return nowcasts.find((entry: ImdNowcastPayload) => {
        const station = String(entry.Station ?? '').trim().toLowerCase();
        return station === districtName.trim().toLowerCase();
      }) ?? null;
    } catch (error: any) {
      const msg = error?.response?.status 
        ? `Status ${error.response.status} - ${error.message}` 
        : error.message;
      logger.warn({ err: msg }, 'IMD Nowcast API Failed');
      return null;
    }
  },

  async fetchRealPOIs(lat: number, lon: number, radiusMeters: number = 1000) {
    try {
      // Overpass QL: Look for specific amenities within a radius of the lat/lon
      const query = `
        [out:json][timeout:3];
        (
          node["amenity"~"police|hospital|clinic"](around:${radiusMeters},${lat},${lon});
          node["amenity"~"bar|pub|nightclub"](around:${radiusMeters},${lat},${lon});
          node["shop"](around:${radiusMeters},${lat},${lon});
        );
        out tags;
      `;
      
      const response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'YatraXSafeTravelApp/1.0 (vedantlahane@gmail.com)'
        },
        timeout: 4000
      });

      // Parse the counts from the Overpass response
      const elements = response.data.elements || [];
      let safetyCount = 0;
      let riskyCount = 0;
      let businessCount = 0;

      for (const el of elements) {
        if (el.tags?.amenity?.match(/police|hospital|clinic/)) safetyCount++;
        else if (el.tags?.amenity?.match(/bar|pub|nightclub/)) riskyCount++;
        else if (el.tags?.shop) businessCount++;
      }

      return {
        nearbyPlaceCount: safetyCount + riskyCount + businessCount,
        safetyPlaceCount: safetyCount,
        riskyPlaceCount: riskyCount,
        openBusinessCount: businessCount
      };

    } catch (error) {
      logger.warn('Overpass OSM API Failed. Falling back to zero-context.');
      return { nearbyPlaceCount: 0, safetyPlaceCount: 0, riskyPlaceCount: 0, openBusinessCount: 0 };
    }
  }
};