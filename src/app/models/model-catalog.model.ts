/**
 * The ModelCatalog data model maps to the model-catalog database collection.
 * This schema specifies relevant metadata for a scientific models available in
 * the SWIM platform.
 */
export interface ModelCatalog {
  /** Scientific model identifier string */
  id: string;
  /** Model given name */
  modelName: string;
  /** Model description */
  modelDescription: string;
  /** Model information */
  info: Array<ModelInfo>;
  /** Creation date */
  dateCreated: Date;
  /** Last modification date */
  dateModified: Date;
  /** Third party modeling software used to develop and execute the model */
  softwareAgent: string;
  /** Model license policy */
  license: string;
  /** Model release version */
  version: string;
  /** Funding source */
  sponsor: string;
  /** Model Authors */
  creators: Array<Creator>;
  /** Residing server information */
  hostServer: Array<HostServer>;
  /** Model execution endpoint information */
  serviceInfo: Array<ServiceInfo>;
}

/**
 * Model information for user purposes
 * Can be in different languages
 */
export interface ModelInfo {
  /** model name in target language */
  name: string;
  /** Model description in target language */
  description: string;
  /** Language of information object */
  lang: string;
}


/**
 * Holds general information about the creators or authors of a scientific model.
 */
export interface Creator {
  /** Full name of the author or creator */
  name: string;
  /** Email address */
  email: string;
  /** Affiliated institution, organization or company */
  organization: string;
}

/**
 * Holds information regarding the computer server where the model is currently stored
 * and executed.
 */
export interface HostServer {
  /** Server DNS alias */
  serverName: string;
  /** Assigned static IP Address */
  serverIP: string;
  /** Name of the server administrator */
  serverAdmin: string;
  /** Email address of the server administrator */
  adminEmail: string;
  /** Name of the server owner */
  serverOwner: string;
}

/**
 * Holds relevant information to access and communicate with the web service endpoint
 * that exposes a scientific model to the web.
 */
export interface ServiceInfo {
  /** Endpoint URL */
  serviceURL: string;
  /** Accepted HTTP method */
  serviceMethod: string;
  /** Service availability status */
  status: string;
  /** Input data payload type */
  consumes: string;
  /** Output data payload type  */
  produces: string;
  /** Public availability */
  isPublic: boolean;
  /** Documentation links */
  externalDocs: Array<string>;
}
