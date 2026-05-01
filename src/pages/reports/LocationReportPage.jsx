import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin";
import LocationReport from "./LocationReport";

export default function LocationReportPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await adminApi.GET_LOCATIONS();
      
      const locationsData = res.data.data || [];

      const transformed = locationsData.map((loc, index) => ({
        sno: index + 1,
        locationName: loc.name || "N/A",
        subCity: loc.subCityName || "N/A",
        lat: loc.lat != null ? loc.lat : "N/A",
        lng: loc.lng != null ? loc.lng : "N/A"
      }));

      setLocations(transformed);
    } catch (err) {
      console.error("Site fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <LocationReport data={locations} loading={loading} onRefresh={fetchLocations} />
  );
}