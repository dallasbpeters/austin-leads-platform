"use client";

import { useMemo, useState, useTransition } from "react";

import { fetchCrmLeads, updateCrmLead } from "@/services/admin/crm";

const defaultFilters = {
  search: "",
  status: "all",
  pipelineStage: "all",
  serviceInterest: "all",
};

export function useCrmManager({
  initialOverview,
  initialPipeline,
  initialLeads,
}) {
  const [overview, setOverview] = useState(initialOverview);
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [leads, setLeads] = useState(initialLeads);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeads[0]?.id || null);
  const [error, setError] = useState("");
  const [isRefreshing, startRefresh] = useTransition();
  const [isSaving, startSave] = useTransition();

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) || leads[0] || null,
    [leads, selectedLeadId],
  );

  function applyPayload(payload) {
    setOverview(payload.overview);
    setPipeline(payload.pipeline);
    setLeads(payload.leads);
    setSelectedLeadId((current) =>
      payload.leads.some((lead) => lead.id === current)
        ? current
        : payload.leads[0]?.id || null,
    );
  }

  function refresh(nextFilters = filters) {
    startRefresh(async () => {
      try {
        setError("");
        const payload = await fetchCrmLeads(nextFilters);
        applyPayload(payload);
      } catch (refreshError) {
        setError(refreshError.message || "Unable to refresh CRM.");
      }
    });
  }

  function updateFilter(key, value) {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);
    refresh(nextFilters);
  }

  function saveLead(updates) {
    if (!selectedLead) {
      return;
    }

    startSave(async () => {
      try {
        setError("");
        const { lead } = await updateCrmLead(selectedLead.id, updates);
        setLeads((current) =>
          current.map((item) => (item.id === lead.id ? lead : item)),
        );
        refresh(filters);
      } catch (saveError) {
        setError(saveError.message || "Unable to update lead.");
      }
    });
  }

  return {
    error,
    filters,
    isRefreshing,
    isSaving,
    leads,
    overview,
    pipeline,
    selectedLead,
    setSelectedLeadId,
    refresh,
    saveLead,
    updateFilter,
  };
}
