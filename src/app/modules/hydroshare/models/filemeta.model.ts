/**
 *  Model for file metadata
 */
export interface FileMeta {
  /** The filename, including the path */
  file_name: String;
  /** The url to download the file */
  url: String
  /** size maybe in bytes? */
  size: Number
  /** text? model instance serialization? */
  content_type: String;
  /** file extension? */
  logical_file_type: String;
  /** modified_time */
  modified_time: String;
  /** md5 or sha1 algorithm??? */
  checksum: String;

}
