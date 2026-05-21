CREATE TABLE "tourist_pois" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"osm_id" bigint,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"geom" "geography(Geometry, 4326)" NOT NULL,
	"city" text NOT NULL,
	"district" text DEFAULT 'Punjab' NOT NULL,
	"state" text DEFAULT 'Punjab' NOT NULL,
	"phone" text,
	"website" text,
	"opening_hours" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tourist_pois_osmId_unique" UNIQUE("osm_id")
);
--> statement-breakpoint
ALTER TABLE "tourists" ADD COLUMN "admin_manual_penalty" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "poi_geom_idx" ON "tourist_pois" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "poi_type_idx" ON "tourist_pois" USING btree ("type");--> statement-breakpoint
CREATE INDEX "poi_osm_id_idx" ON "tourist_pois" USING btree ("osm_id");--> statement-breakpoint
CREATE INDEX "poi_active_idx" ON "tourist_pois" USING btree ("is_active");