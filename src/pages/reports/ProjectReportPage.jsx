import React, { useEffect, useState } from "react";
import projectApi from "../../api/modules/project";
import ProjectReport from "./ProjectReport";

export default function ProjectReportPage() {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {

    try {

      setLoading(true);

      const res = await projectApi.GET_PROJECTS({ page: 0, size: 1000 });

      const pageData = res.data.data;
      console.log(pageData)
      setProjects(pageData.content || []);


    } catch (err) {

      console.error("Report fetch error:", err);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchProjects();

  }, []);

  return (
    <ProjectReport
      data={projects}
      loading={loading}
      onRefresh={fetchProjects}
    />
  );

}
