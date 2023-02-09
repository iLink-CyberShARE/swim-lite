
/**
 * The item model maps to an item request from the SWIM recommender system.
 */
export interface Item {
  /** unique identifier from recommender system database */
  id: number;
  /** related recommender model id */
  model_id : string;
  /** related category id */
  category_id : number;
  /** global unique identifier */
  guid: string;
  /** human readable label */
  name: string
}
