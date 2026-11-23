/** The catalog tables that live per season and carry a lineage. */
export type CatalogModelName =
  | "licenseType"
  | "licenseSubtype"
  | "category"
  | "supplement"
  | "supplementGroup";

/** What an admin chose to carry over: the wording, or the retired state. */
export type PropagationScope = "texts" | "state";

/** An edit that has just been saved in one year and could reach the others. */
export type PropagationRequest = {
  model: CatalogModelName;
  id: string;
  scope: PropagationScope;
};

/** What the panel needs to word the question. */
export type PropagationTargets = {
  /** The name as it stands after the save, not the one the client still holds. */
  name: string;
  /** The state after the save, so the question can say retirar or reactivar. */
  active: boolean;
  sourceYear: number;
  /** The open seasons the change could also reach. Empty means do not ask. */
  years: number[];
};
