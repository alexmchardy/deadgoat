-- Viewport queries compare against a plain lon/lat rectangle, so they index the geometry form.
create index infestations_location_geom_idx on infestations using gist ((location::geometry));
