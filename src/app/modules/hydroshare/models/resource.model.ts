
/**
 * Base model for HS resource
 *
 *  resource_types: GenericResource, RasterResource, RefTimeSeriesResource, TimeSeriesResource, ModelProgramResource, ModelInstanceResource,
 *  ToolResource, SWATModelInstanceResource, GeographicFeatureResource, ScriptResource, CollectionResource, MODFLOWModelInstanceResource, CompositeResource ]
 */

import { Creator } from "src/app/models/model-catalog.model";
import { Award } from "./award.model";
import { Contributor } from "./contributor.model";
import { Publisher } from "./publisher.model";
import { Right } from "./right.model";
import { TCoverage } from "./tcoverage.model";

export interface Resource {
  /** Unique resource identifier on HS */
  resource_id?: string;
  /** Title of the resouce */
  title: string;
  /** A string containing a summary of a resource */
  abstract: string;
  /** A 3-character string for the language in which the metadata and content of a resource are expressed */
  language?: string;
  /** HS type of resource */
  resource_type: string;
  /** A list of keyword strings expressing the topic of a resource */
  subjects?: Array<string>;
  /** A list of keyword strings expressing the topic of a resource */
  keywords?: Array<string>;
  /** Keyvalue pairs of additional metadata */
  extra_metadata?: Object;
  /** A string containing the bibliographic citation for a resource */
  citation?: string;
  /** A list of objects containing information about the funding agencies and awards associated with a resource */
  awards?: Array<Award>;
  /** A list of Contributor objects indicating the entities that contributed to a resource */
  contributors?: Array<Contributor>;
  /** A list of Relation objects representing resources related to a described resource */
  relations?: Array<Resource>;
  /** A list of Creator objects indicating the entities responsible for creating a resource */
  creators?: Array<Creator>;
  /** An object containing information about the temporal topic or applicability of a resource */
  period_coverage?: TCoverage;
  /** An object containing information about the publisher of a resource */
  publisher?: Publisher;
  /** information about rights held in an over a resource */
  rights?: Right;
  /** An object containing information about the spatial topic of a resource, the spatial applicability
   * of a resource, or jurisdiction under with a resource is relevant */
  spatial_coverage?: Object;
  /** Web url to the hydroshare resource */
  url?: string;
  /** Unique HS resource identifier  */
  identifier?: string;
  /** Datetime of resource creation */
  created?: string;
  /** Datetime of last resource modification */
  modified?: string;
}


