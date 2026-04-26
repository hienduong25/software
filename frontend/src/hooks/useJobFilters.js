import { useMemo, useState } from "react";

/**
 * Hook quản lý filter, sort và search cho danh sách jobs.
 */
export function useJobFilters(jobs, appliedJobs) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const availableLocations = useMemo(() => {
    const locs = jobs.map((job) => job.location?.trim()).filter(Boolean);
    return [...new Set(locs)].sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return jobs
      .filter((job) => {
        const hasApplied = appliedJobs.includes(String(job.jobId));
        const isFull = job.currentApplicants >= (job.maxApplicants || 0);
        const content = [
          job.title,
          job.companyName || job.company,
          job.location,
          job.description,
          job.requirements,
          job.salary_range || job.salary,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (!term || content.includes(term)) &&
          (locationFilter === "all" ||
            (job.location || "").trim() === locationFilter) &&
          (statusFilter === "all" ||
            (statusFilter === "active" && !isFull) ||
            (statusFilter === "closed" && isFull)) &&
          (applicationFilter === "all" ||
            (applicationFilter === "applied" && hasApplied) ||
            (applicationFilter === "not_applied" && !hasApplied))
        );
      })
      .sort((a, b) => {
        const aApplied = appliedJobs.includes(String(a.jobId));
        const bApplied = appliedJobs.includes(String(b.jobId));
        const aRemaining = (a.maxApplicants || 0) - (a.currentApplicants || 0);
        const bRemaining = (b.maxApplicants || 0) - (b.currentApplicants || 0);

        switch (sortBy) {
          case "title":
            return (a.title || "").localeCompare(b.title || "");
          case "company":
            return (a.companyName || a.company || "").localeCompare(
              b.companyName || b.company || "",
            );
          case "remaining_slots":
            return bRemaining - aRemaining;
          case "latest":
          default:
            if (bApplied !== aApplied) return Number(aApplied) - Number(bApplied);
            return Number(b.jobId || 0) - Number(a.jobId || 0);
        }
      });
  }, [jobs, searchTerm, locationFilter, statusFilter, applicationFilter, sortBy, appliedJobs]);

  const activeFilterCount = [
    searchTerm.trim(),
    locationFilter !== "all",
    statusFilter !== "all",
    applicationFilter !== "all",
    sortBy !== "latest",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm("");
    setLocationFilter("all");
    setStatusFilter("all");
    setApplicationFilter("all");
    setSortBy("latest");
  };

  return {
    searchTerm, setSearchTerm,
    locationFilter, setLocationFilter,
    statusFilter, setStatusFilter,
    applicationFilter, setApplicationFilter,
    sortBy, setSortBy,
    availableLocations,
    filteredJobs,
    activeFilterCount,
    resetFilters,
  };
}
