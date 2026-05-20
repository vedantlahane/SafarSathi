import axios from 'axios';
import { env } from '../../shared/config/env.js';
import { logger } from '../../shared/logger/index.js';

export interface MlBaselinePayload {
  status?: string;
  ml_baseline?: Record<string, unknown> | null;
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

function getImdAuthHeader(): string {
  return `Bearer ${env.IMD_API_KEY}`;
}

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
      const message = axios.isAxiosError(error) ? error.message : (error as Error).message;
      logger.error({ err: message }, 'Python ML Engine Failed');
      return { status: 'OFFLINE', ml_baseline: null, infrastructure: null, spatial_context: null };
    }
  },

  async fetchLiveAqi(lat: number, lon: number): Promise<LiveAqiPayload> {
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone`;
      const response = await axios.get<LiveAqiPayload>(url, { timeout: 3000 });
      return (response.data as { current?: LiveAqiPayload } | undefined)?.current ?? {};
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.message : (error as Error).message;
      logger.warn({ err: message }, 'Open-Meteo API Failed');
      return {};
    }
  },

  async fetchLiveImdWarning(districtName: string | undefined): Promise<ImdWarningPayload | null> {
    if (!districtName || districtName === 'Unknown') {
      return null;
    }

    try {
      const response = await axios.get<ImdWarningPayload[] | { data?: ImdWarningPayload[] }>(
        'https://api.imd.gov.in/api/v1/districtwarning',
        {
          headers: {
            Authorization: getImdAuthHeader(),
          },
          timeout: 4000,
        },
      );

      const warnings = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as { data?: ImdWarningPayload[] } | undefined)?.data)
          ? ((response.data as { data?: ImdWarningPayload[] }).data ?? [])
          : [];

      return warnings.find((entry) => {
        const district = String(entry.District ?? entry.district ?? '').trim().toLowerCase();
        return district === districtName.trim().toLowerCase();
      }) ?? null;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.message : (error as Error).message;
      logger.warn({ err: message }, 'IMD API Failed');
      return null;
    }
  },
};