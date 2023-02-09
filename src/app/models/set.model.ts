/**
 * The Set data model maps to the set-catalog database collection.
 * It holds unique set name, its values and descriptions. The set object
 * is currently used to define sets that are part of a model developed with
 * the General Algebraic Modeling System (GAMS)
 */
export interface Set {
   /** Set unique name as used on the scientific model source code */
  setName: string;
   /** Assigned set value */
  setValue: string;
  /** Descripton of the set */
  setDescription: string;
}
