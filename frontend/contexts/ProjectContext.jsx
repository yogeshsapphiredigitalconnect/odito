"use client";

import { createContext, useContext, useEffect, useState } from "react";
import apiService from "@/lib/apiService";
import { useAuth } from "@/contexts/AuthContext";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [activeProject, setActiveProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await apiService.getProjects(1, 50);
        const list = response.data?.projects || response.data || [];
        setProjects(list);

        // Auto-select first project if no active project is set
        if (list.length > 0 && !activeProject) {
          setActiveProject(list[0]);
        } else if (activeProject && list.length > 0) {
          // Verify active project still exists in the list
          const stillExists = list.some(p => p._id === activeProject._id);
          if (!stillExists) {
            // Active project was deleted, select first available
            setActiveProject(list[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, activeProject]);

  const value = {
    activeProject,
    activeProjectId: activeProject?._id || null,
    setActiveProject,
    projects,
    isLoading,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
