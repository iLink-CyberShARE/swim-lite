import { Graph } from 'graphs-adt';

/**
 * Converter annotation  model (map of conversion functions)
 */
export interface Converter {
  /** input unit name */
  in: string;
  /** output unit name */
  out: string;
  /** Name of the function that performs conversion */
  name: string;
}

/** Class for Path of nodes */
class Path {
  source: string;
  target: string;
  nodes: string[];
  constructor(source: string, target: string, nodes: string[]) {
    this.source = source;
    this.target = target;
    this.nodes = nodes;
  }
}

/**
 * Unit Converter Class
 */
export class UnitConverter {

  /**
   * Conversion catalog in English
   */
  private conversionOptionsEN: any[] = [
    //  cubic foot per second
    {
      in: 'cubic foot per second',
      out: ['']
    },
    {
      in: 'Thousands of Acre-Feet',
      out: ['Acre-Feet', 'Millions of Cubic Meters']
    },
    {
      in: 'Acre-Feet',
      out: ['Thousands of Acre-Feet', 'Millions of Cubic Meters', 'US Gallons', 'Liters']
    },
    {
      in: 'Millions of Cubic Meters',
      out: ['Acre-Feet', 'Thousands of Acre-Feet']
    },
    {
      in: 'US Gallons',
      out: ['Acre-Feet', 'Liters']
    },
    {
      in: 'Liters',
      out: ['Acre-Feet', 'US Gallons']
    },
    { in: 'inches/yr', out: ['mm/yr'] },
    { in: 'mm/yr', out: ['inches/yr'] },
    { in: 'acres', out: ['Hectares', 'Square Kilometers'] },
    { in: 'Hectares', out: ['acres', 'Square Kilometers'] },
    { in: 'Square Kilometers', out: ['acres', 'Hectares'] },
    { in: 'Feet', out: ['Meters'] },
    { in: 'Meters', out: ['Feet'] },
    { in: 'US Dollars per Acre-Foot', out: ['Mexican Pesos per Cubic Meter', 'US Dollars per Gallon','US Dollars per Liter'] },
    { in: 'Mexican Pesos per Cubic Meter', out: ['US Dollars per Acre-Foot'] },
    { in: 'US Dollars per Gallon', out: ['US Dollars per Acre-Foot','US Dollars per Liter'] },
    { in: 'US Dollars per Liter', out: ['US Dollars per Acre-Foot','US Dollars per Gallon'] },
    { in: 'Thousand Millon Mexican Pesos', out: ['Thousands of US Dollars'] },
    { in: 'Thousands of US Dollars', out: ['Thousand Millon Mexican Pesos'] },
    { in: 'US Dollars per Foot', out: ['Mexican Pesos per Meter'] },
    { in: 'Mexican Pesos per Meter', out: ['US Dollars per Foot'] },
    { in: 'Tonnes per Acre', out: ['Tonnes per Hectare'] },
    { in: 'Tonnes per Hectare', out: ['Tonnes per Acre'] },
    { in: 'Thousands of Acres', out: ['Thousands of Hectares'] },
    { in: 'Thousands of Hectares', out: ['Thousands of Acres'] },
    { in: 'US Dollars', out: ['Mexican Pesos'] },
    { in: 'Mexican Pesos', out: ['US Dollars'] },
    { in: 'US Dollars per Ton', out: ['Mexican Pesos per Ton'] },
    { in: 'Mexican Pesos per Ton', out: ['US Dollars per Ton'] },
    { in: 'US Dollars per Acre', out: ['Mexican Pesos per Hectare'] },
    { in: 'Mexican Pesos per Hectare', out: ['US Dollars per Acre'] }
  ];

  /**
   * Conversion catalog in Spanish
   */
  private conversionOptionsES: any[] = [
    {
      in: 'pies cubicos por segundo',
      out: ['']
    },
    {
      in: 'Miles de Acre-Pies',
      out: ['Acre-Pies', 'Millones de Metros Cubicos']
    },
    {
      in: 'Acre-Pies',
      out: ['Miles de Acre-Pies', 'Millones de Metros Cubicos', 'Galones', 'Litros']
    },
    {
      in: 'Millones de Metros Cubicos',
      out: ['Acre-Pies', 'Miles de Acre-Pies']
    },
    {
      in: 'Galones',
      out: ['Acre-Pies', 'Litros']
    },
    {
      in: 'Litros',
      out: ['Acre-Pies', 'Galones']
    },
    { in: 'pulgadas/año', out: ['mm/año'] },
    { in: 'mm/año', out: ['pulgadas/año'] },
    { in: 'acres', out: ['Hectareas', 'Kilometros Cuadrados'] },
    { in: 'Hectareas', out: ['acres', 'Kilometros Cuadrados'] },
    { in: 'Kilometros Cuadrados', out: ['acres', 'Hectareas'] },
    { in: 'Pies', out: ['Metros'] },
    { in: 'Metros', out: ['Pies'] },
    { in: 'Dolares por Acre-Pie', out: ['Pesos por Metro Cubico', 'Dolares por Galon','Dolares por Litro'] },
    { in: 'Dolares por Galon', out: ['Dolares por Acre-Pie','Dolares por Litro'] },
    { in: 'Dolares por Litro', out: ['Dolares por Acre-Pie','Dolares por Galon'] },
    { in: 'Pesos por Metro Cubico', out: ['Dolares por Acre-Pie'] },
    { in: 'Miles de Millones de Pesos', out: ['Miles de Dolares'] },
    { in: 'Miles de Dolares', out: ['Miles de Millones de Pesos'] },
    { in: 'Dolares por Pie', out: ['Pesos por Metro'] },
    { in: 'Pesos por Metro', out: ['Dolares por Pie'] },
    { in: 'Toneladas por Acre', out: ['Toneladas por Hectarea'] },
    { in: 'Toneladas por Hectarea', out: ['Toneladas por Acre'] },
    { in: 'Miles de Acres', out: ['Miles de Hectareas'] },
    { in: 'Miles de Hectareas', out: ['Miles de Acres'] },
    { in: 'Dolares', out: ['Pesos'] },
    { in: 'Pesos', out: ['Dolares'] },
    { in: 'Dolares por Tonelada', out: ['Pesos por Tonelada'] },
    { in: 'Pesos por Tonelada', out: ['Dolares por Tonelada'] },
    { in: 'Dolares por Acre', out: ['Pesos por Hectarea'] },
    { in: 'Pesos por Hectarea', out: ['Dolares por Acre'] }
  ];

  /**
   * Annotation of conversion functions with accepted input units and resulting output units
   */
  private converterDictionaryEN: Converter[] = [
    { in: 'Thousands of Acre-Feet', out: 'Acre-Feet', name: 'MulThousand' },
    { in: 'Acre-Feet', out: 'Thousands of Acre-Feet', name: 'DivThousand' },
    { in: 'inches/yr', out: 'mm/yr', name: 'InToMilliMeters' },
    { in: 'mm/yr', out: 'inches/yr', name: 'MilliMetersToIn' },
    { in: 'Acres', out: 'Square Kilometers', name: 'AcToKm2' },
    { in: 'Square Kilometers', out: 'Acres', name: 'Km2ToAc' },
    { in: 'Square Kilometers', out: 'Hectares', name: 'MulHundred' },
    { in: 'Hectares', out: 'Square Kilometers', name: 'DivHundred' },
    { in: 'Feet', out: 'Meters', name: 'FeetToMeter' },
    { in: 'Meters', out: 'Feet', name: 'MeterToFeet' },
    { in: 'Acre-Feet', out: 'Millions of Cubic Meters', name: 'AFtoHC' },
    { in: 'Millions of Cubic Meters', out: 'Acre-Feet', name: 'HCtoAF' },
    { in: 'Thousands of US Dollars', out: 'Thousands of Mexican Pesos', name: 'USDToMXN' },
    { in: 'Thousands of Mexican Pesos', out: 'Thousand Millon Mexican Pesos', name: 'DivMillion' },
    { in: 'Thousand Millon Mexican Pesos', out: 'Thousands of Mexican Pesos', name: 'MulMillion' },
    { in: 'Thousands of Mexican Pesos', out: 'Thousands of US Dollars', name: 'MXNToUSD' },
    { in: 'US Dollars per Acre-Foot', out: 'US Dollars per Cubic Meter', name: 'AFToM3' },
    { in: 'US Dollars per Acre-Foot', out: 'US Dollars per Gallon', name: 'USGaltoAF' },
    { in: 'US Dollars per Gallon', out: 'US Dollars per Acre-Foot', name: 'AFtoUSGal' },
    { in: 'US Dollars per Gallon', out: 'US Dollars per Liter', name: 'LitertoUSGal' },
    { in: 'US Dollars per Liter', out: 'US Dollars per Gallon', name: 'USGaltoLiter' },
    { in: 'US Dollars per Cubic Meter', out: 'Mexican Pesos per Cubic Meter', name: 'USDToMXN' },
    { in: 'Mexican Pesos per Cubic Meter', out: 'US Dollars per Cubic Meter', name: 'MXNToUSD' },
    { in: 'US Dollars per Cubic Meter', out: 'US Dollars per Acre-Foot', name: 'M3ToAF' },
    { in: 'US Dollars per Foot', out: 'US Dollars per Meter', name: 'FeetToMeter' },
    { in: 'US Dollars per Meter', out: 'Mexican Pesos per Meter', name: 'USDToMXN' },
    { in: 'Mexican Pesos per Meter', out: 'US Dollars per Meter', name: 'MXNToUSD' },
    { in: 'US Dollars per Meter', out: 'US Dollars per Foot', name: 'MeterToFeet' },
    { in: 'Tonnes per Acre', out: 'Tonnes per Hectare', name: 'TperACToTperHa' },
    { in: 'Tonnes per Hectare', out: 'Tonnes per Acre', name: 'TperHaToTperAC' },
    { in: 'Thousands of Acres', out: 'Thousands of Square Kilometers', name: 'AcToKm2' },
    { in: 'Thousands of Square Kilometers', out: 'Thousands of Hectares', name: 'MulHundred' },
    { in: 'Thousands of Hectares', out: 'Thousands of Square Kilometers', name: 'DivHundred' },
    { in: 'Thousands of Square Kilometers', out: 'Thousands of Acres', name: 'Km2ToAc' },
    { in: 'US Dollars', out: 'Mexican Pesos', name: 'USDToMXN' },
    { in: 'Mexican Pesos', out: 'US Dollars', name: 'MXNToUSD' },
    { in: 'US Dollars per Ton', out: 'Mexican Pesos per Ton', name: 'USDToMXN' },
    { in: 'Mexican Pesos per Ton', out: 'US Dollars per Ton', name: 'MXNToUSD' },
    { in: 'US Dollars per Acre', out: 'US Dollars per Square Kilometer', name: 'AcToKm2' },
    { in: 'US Dollars per Square Kilometer', out: 'US Dollars per Hectare', name: 'MulHundred' },
    { in: 'US Dollars per Hectare', out: 'Mexican Pesos per Hectare', name: 'MXNToUSD' },
    { in: 'Mexican Pesos per Hectare', out: 'US Dollars per Hectare', name: 'USDToMXN' },
    { in: 'US Dollars per Hectare', out: 'US Dollars per Square Kilometer', name: 'DivHundred' },
    { in: 'US Dollars per Square Kilometer', out: 'US Dollars per Acre', name: 'Km2ToAc' },
    { in: 'Acre-Feet', out: 'US Gallons', name:'AFtoUSGal'},
    { in: 'US Gallons', out:'Acre-Feet', name:'USGaltoAF'},
    { in: 'US Gallons', out: 'Liters', name: 'USGaltoLiter'},
    { in: 'Liters', out: 'US Gallons', name: 'LitertoUSGal'}
  ];

  /**
   * English - Spanish dictionary
   */
  private englishSpanishDictionary: Map<string, string>;

  /** A functions graph represented as an adjacency matrix */
  FunctionsGraph: number[][];

  /** A cache to store a path between source-target */
  PathCache: Path[] = [];

  /** Language */
  private lang = 'en-us';

  /** Unit Precision */
  private precision = 8;

  constructor() {
    this.englishSpanishDictionary = new Map<string, string>();

    // add translations here
    this.englishSpanishDictionary.set('Acre-Feet', 'Acre-Pies');
    this.englishSpanishDictionary.set('Thousands of Acre-Feet', 'Miles de Acre-Pies');
    this.englishSpanishDictionary.set('inches/yr', 'pulgadas/año');
    this.englishSpanishDictionary.set('mm/yr', 'mm/año');
    this.englishSpanishDictionary.set('Acres', 'Acres');
    this.englishSpanishDictionary.set('Square Kilometers', 'Kilometros Cuadrados');
    this.englishSpanishDictionary.set('Hectares', 'Hectareas');
    this.englishSpanishDictionary.set('Feet', 'Pies');
    this.englishSpanishDictionary.set('Meters', 'Metros');
    this.englishSpanishDictionary.set('Millions of Cubic Meters', 'Millones de Metros Cubicos');
    this.englishSpanishDictionary.set('Thousands of US Dollars', 'Miles de Dolares');
    this.englishSpanishDictionary.set('Thousands of Mexican Pesos', 'Miles de Pesos');
    this.englishSpanishDictionary.set('Thousand Millon Mexican Pesos', 'Miles de Millones de Pesos');
    this.englishSpanishDictionary.set('US Dollars per Acre-Foot', 'Dolares por Acre-Pie');
    this.englishSpanishDictionary.set('US Dollars per Cubic Meter', 'Dolares por Metro Cubico');
    this.englishSpanishDictionary.set('US Dollars per Foot', 'Dolares por Pie');
    this.englishSpanishDictionary.set('US Dollars per Meter', 'Dolares por Metro');
    this.englishSpanishDictionary.set('Tonnes per Acre', 'Toneladas por Acre');
    this.englishSpanishDictionary.set('Tonnes per Hectare', 'Toneladas por Hectarea');
    this.englishSpanishDictionary.set('Thousands of Acres', 'Miles de Acres');
    this.englishSpanishDictionary.set('Thousands of Square Kilometers', 'Miles de Kilometros Cuadrados');
    this.englishSpanishDictionary.set('US Dollars', 'Dolares');
    this.englishSpanishDictionary.set('Mexican Pesos', 'Pesos');
    this.englishSpanishDictionary.set('US Dollars per Ton', 'Dolares por Tonelada');
    this.englishSpanishDictionary.set('US Dollars per Acre', 'Dolares por Acre');
    this.englishSpanishDictionary.set('US Dollars per Square Kilometer', 'Dolares por Kilometro Cuadrado');
    this.englishSpanishDictionary.set('US Dollars per Hectare', 'Dolares por Hectarea');
    this.englishSpanishDictionary.set('Mexican Pesos per Hectare', 'Pesos por Hectarea');
    this.englishSpanishDictionary.set('Mexican Pesos per Cubic Meter', 'Pesos por Metro Cubico');
    this.englishSpanishDictionary.set('Thousands of Hectares', 'Miles de Hectareas');
    this.englishSpanishDictionary.set('Mexican Pesos per Ton', 'Pesos por Tonelada');
    this.englishSpanishDictionary.set('Mexican Pesos per Meter', 'Pesos por Metro');
    this.englishSpanishDictionary.set('US Gallons', 'Galones');
    this.englishSpanishDictionary.set('Liters', 'Litros');
    this.englishSpanishDictionary.set('US Dollars per Gallon', 'Dolares por Galon');
    this.englishSpanishDictionary.set('US Dollars per Liter', 'Dolares por Litro');

  }

  /**
   * Converts value from source units to target units
   * @param source the input unit name
   * @param target the output unit name
   * @param value the input value in source units
   */
  public Convert(source: string, target: string, value: number) {

    try {

      // TODO: refactor this into something better
      if ( this.lang === 'es-mx') {
        source = this.toEnglish(source);
        target = this.toEnglish(target);
      }

      const converter = this.converterDictionaryEN.find(
        c => c.in === source && c.out === target
      );

      if (typeof converter !== 'undefined') {
        // perform direct conversion
        const result = this[converter.name](value).toPrecision(8);
        return +result;
      } else {
        // perform orchestration
        const result = this.Orchestrate(source, target, value).toPrecision(8);
        return +result;
      }
    } catch (error) {
      console.log('Error Occurred' + error);
      return null;
    }
  }

  /**
   * Helper function to translate a text to English, returns null if not found in english spanish dictionary
   * @param text Text to translate
   */
  toEnglish(text: string) {
    if (this.englishSpanishDictionary.has(text)) {
      return text;
    }
    let translation: string;
    this.englishSpanishDictionary.forEach((value, key, map) => {
      if (map.get(key) === text) {
        translation = key;
      }
    });
    if (translation == null) {
      console.log('Error ocurred: spanish request not found in dictionary = ' + text);
    }
    return translation;
  }

  /**
   * Gets a list of conversion options for the source unit
   * @param source name of the source unit
   */
  public GetConversionOptions(source: string) {

    let options = null;

    if (this.lang === 'en-us') {
      options = this.conversionOptionsEN.find(o => o.in === source);
    } else {
      options = this.conversionOptionsES.find(o => o.in === source);
    }

    if (typeof options !== 'undefined') {
      return options.out;
    }

    return null;
  }

  /**
   * Orchestration methods
   */

  /**
   * Orchestration will occur when a pathway has to be found between a source and a target.
   * Algorithm:
   * If path exists in cache
   *  Return the execution of path from cache
   * Create a general graph to check if there exists a path - GetGraph
   * If not, return null
   * Create graph for every output, use backtracking, adjacency matrix
   *  Using adjacency matrix, check if there exists a path
   *    create graph on third-party lib
   *    get shortest path and compare the current path
   * Store in cache
   * Execute path
   * Return response from path execution
   * @param source name of the unit source
   * @param target name of th eunit target
   */
  private Orchestrate(source: string, target: string, value: number) {
    if (source === null || target === null || value === null) {
      console.log('Error Occurred: source, target, or value are null');
      return null;
    }

    if (this.CacheContainsPath(source, target)) {
      return this.ExecutePath(this.GetPathCache(source, target), value);
    }

    if (this.FunctionsGraph == null || this.FunctionsGraph.length === 0) {
      this.FunctionsGraph = this.GetGraph();
    }

    if (!this.ContainsSourceTarget(source, target, this.FunctionsGraph)) {
      console.log('Error Occurred: there is no path between source - target');
      return null;
    }

    const path = this.GetShortestPathSourceTarget(source, target, this.FunctionsGraph);
    this.PathCache.push(new Path(source, target, path));
    return this.ExecutePath(path, value);

  }

  /**
   * Returns the path using Dijkstra algorithm
   * It takes into consideration that several Functions might output or receive the target/source
   * It uses "graphs-adt"
   * @param source name of the unit source
   * @param target name of the target source
   */
  private GetShortestPathSourceTarget(source: string, target: string, AdjacencyMatrix: number[][]): string[] {
    let MinDistance = Number.MAX_VALUE;
    let Path: string[] = [];
    const CandidateNodesInput = this.GetNodesInput(source);
    // create a subgraph for every output
    const CandidateNodesOutput = this.GetNodesOutput(target);
    for (const CandidateNodeOutput of CandidateNodesOutput) {
      const ADTSubGraph = this.GetADTSubGraph(CandidateNodeOutput, AdjacencyMatrix);
      for (const CandidateNodeInput of CandidateNodesInput) {
        if (!this.SubGraphContainsNode(CandidateNodeInput, CandidateNodeOutput, AdjacencyMatrix)) {
          continue;
        }
        const DijkstraOutput = ADTSubGraph.dijkstra(CandidateNodeInput.name);
        if (DijkstraOutput[CandidateNodeOutput.name].distance < MinDistance) {
          MinDistance = DijkstraOutput[CandidateNodeOutput.name].distance;
          Path = ADTSubGraph.getPath(CandidateNodeInput.name, CandidateNodeOutput.name);
        }
      }
    }
    return Path;
  }

  /**
   * Returns true if there is a path between the input node and output node
   * @param CandidateNodeInput input node
   * @param CandidateNodeOutput output node
   * @param AdjacencyMatrix graph
   */
  SubGraphContainsNode(CandidateNodeInput: Converter, CandidateNodeOutput: Converter, AdjacencyMatrix: number[][]) {

    const stack: Converter[] = [];
    const visited = new Set();
    stack.push(CandidateNodeOutput);

    while (stack.length > 0) {
      const Node = stack.pop();
      if (Node === CandidateNodeInput) {
        return true;
      }
      for (let i = 0; i < AdjacencyMatrix.length; i++) {
        if (AdjacencyMatrix[i][this.converterDictionaryEN.indexOf(Node)] !== 0
          && !visited.has(this.converterDictionaryEN[i])) {
          stack.push(this.converterDictionaryEN[i]);
        }
      }
      visited.add(Node);
    }
    return false;
  }

  /**
   * Returns an ADT Graph backtracking from a candidate node that outputs target
   * @param target target node
   * @param Graph graph source
   */
  GetADTSubGraph(CandidateNodeOutput: Converter, AdjacencyMatrix: number[][]) {
    const graph = new Graph({
      directed: true
    });
    const stack: Converter[] = [];
    const visited = new Set();
    graph.addNode(CandidateNodeOutput.name);
    stack.push(CandidateNodeOutput);

    while (stack.length > 0) {
      const Node = stack.pop();
      for (let i = 0; i < AdjacencyMatrix.length; i++) {
        if (AdjacencyMatrix[i][this.converterDictionaryEN.indexOf(Node)] !== 0
          && !visited.has(this.converterDictionaryEN[i])) {
          stack.push(this.converterDictionaryEN[i]);
          graph.addNode(this.converterDictionaryEN[i].name);
          graph.addEdge(this.converterDictionaryEN[i].name, Node.name, this.GetWeight());
        }
      }
      visited.add(Node);
    }
    return graph;
  }

  /**
   * Returns the nodes that receives a specific source
   * @param source name of the source unit
   */
  private GetNodesInput(source: string) {
    const stack: Converter[] = [];
    for (let i = 0; i < this.converterDictionaryEN.length; i++) {
      if (this.converterDictionaryEN[i].in === source) {
        stack.push(this.converterDictionaryEN[i]);
      }
    }
    return stack;
  }

  /**
   * Returns the nodes that output a specific target
   * @param target name of the target unit
   */
  private GetNodesOutput(target: string) {
    const stack: Converter[] = [];
    for (let i = 0; i < this.converterDictionaryEN.length; i++) {
      if (this.converterDictionaryEN[i].out === target) {
        stack.push(this.converterDictionaryEN[i]);
      }
    }
    return stack;
  }

  /**
   * Returns the result from executing several functions from a given path
   * @param path Functions to execute
   */
  private ExecutePath(path: string[], value: number) {
    let output = value;
    for (let i = 0; i < path.length; i++) {
      // let nextFunction = path[i];
      output = this[path[i]](output);
    }
    return output;
  }

  /**
   * Returns the path stored in cache
   * @param source name of the source units
   * @param target name of the target units
   */
  private GetPathCache(source: string, target: string) {
    for (let i = 0; i < this.PathCache.length; i++) {
      if (this.PathCache[i].source === source && this.PathCache[i].target === target) {
        return this.PathCache[i].nodes;
      }
    }
    return null;
  }

  /**
   * Returns true if cache (PathCache) contains a path between the source and target
   * @param source name the source units
   * @param target name of the target units
   */
  private CacheContainsPath(source: string, target: string) {
    for (let i = 0; i < this.PathCache.length; i++) {
      if (this.PathCache[i].source === source && this.PathCache[i].target === target) {
        return true;
      }
    }
    return false;
  }

  /**
   * Depth-first-search that returns true if there exists a path between a source and target in a given graph
   * @param source name of the source unit
   * @param target name of the target unit
   */
  private ContainsSourceTarget(source: string, target: string, Graph: number[][]) {
    let stack: Converter[] = [];
    const visited = new Set();

    stack = this.GetNodesInput(source);
    while (stack.length > 0) {
      const Function = stack.pop();
      if (Function == null){
        continue;
      }
      if (Function.out === target) {
        return true;
      }
      visited.add(Function);
      for (let i = 0; i < Graph.length; i++) {
        if (Graph[this.converterDictionaryEN.indexOf(Function)][i] === 1
          && !visited.has(this.converterDictionaryEN[i])) {
          stack.push(this.converterDictionaryEN[i]);
          }
      }
    }
    return false;
  }

  /**
   * Initialize the adjacency matrix, representing a graph, from the converterDictionaryEN
   */
  private GetGraph() {
    const Graph: number[][] = [];
    for (let i = 0; i < this.converterDictionaryEN.length; i++) {
      Graph[i] = [];
      const Function = this.converterDictionaryEN[i];
      for (let j = 0; j < this.converterDictionaryEN.length; j++) {
        if (Function != null && this.converterDictionaryEN[j] !== Function
          && this.converterDictionaryEN[j].in === Function.out) {
          Graph[i][j] = this.GetWeight();
        } else {
          Graph[i][j] = 0;
        }
      }
    }
    return Graph;
  }

  /**
   * Method to calculate and return the weight of a specific edge in the graph
   */
  private GetWeight() {
    // TODO: Define strategy set weights on graph
    return 1;
  }

  /***************************** Unit System Conversions ****************************/

  /**
   * Acre-Feet (AF) to Millions of Cubic Meters (Mm3)
   * @param value input in acre-feet (AF)
   */
  private AFtoHC(value: number) {
    return (value / 810.71318);
  }

  /**
   * Millions of cubic meters (Mm3) to Acre-Feet (ac)
   * @param value input in millions of cubic meters (Mm3)
   */
  private HCtoAF(value: number) {
    return (value * 810.71318);
  }

  /**
   * Acre-Feet (AF) to Gallons (US gal)
   * @param value input in acre-feet (AF)
   */
  private AFtoUSGal(value: number){
      return (value * 325851.427);
  }

  /**
   * US Gallon (US Gal) to Acre-Feet (AF)
   * @param value input in US gallons (US Gal)
   * @returns
   */
  private USGaltoAF(value: number){
    return (value / 325851.427);
  }

  /**
   * US Gallon (US Gal) to Liter (lt)
   * @param value input in US gallons (US Gal)
   * @returns
   */
  private USGaltoLiter(value: number){
    return (value * 3.7854);
  }

  /**
   * Liter(lt) to US Gallon (US Gal)
   * @param value input in liter (lt)
   * @returns
   */
  private LitertoUSGal(value: number){
    return (value / 3.7854);
  }

  /**
   * Convert inches (in) to millimeters (mm)
   * @param value input in inches (in)
   */
  private InToMilliMeters(value: number) {
    return (value * 25.4);
  }

  /**
   * Convert millimeters (mm) to inches (in)
   * @param value input in millimeters (mm)
   */
  private MilliMetersToIn(value: number) {
    return (value / 25.4);
  }

  /**
   * Convert Acres (ac) to Square Kilometers (sq km)
   * @param value input in acres (ac)
   */
  private AcToKm2(value: number) {
    return (value / 247.105381);
  }

  /**
   * Convert square kilometers (sq km) to acres (ac)
   * @param value input in square kilometers (sq km)
   */
  private Km2ToAc(value: number) {
    return (value * 247.105381);
  }

  /**
   * Convert feet (ft) to meters (m)
   * @param value input in feet (ft)
   */
  private FeetToMeter(value: number) {
    return (value / 3.280839895);
  }

  /**
   * Convert meter (m) to feet (ft)
   * @param value input in meters (m)
   */
  private MeterToFeet(value: number) {
    return (value * 3.280839895);
  }

  /**
   * Convert US Dollars (USD) to Mexican Peso (MXN)
   * TODO: Get convertion from a webservice instead... to be decided
   * @param value  input in US dollars (USD)
   */
  private USDToMXN(value: number) {
    return (value * 18.7); // as of Feb 11, 2010
  }

  /**
   * Convert Mexican Peso (MXN) to US Dollars (USD)
   * TODO: Get convertion from a webservice instead... to be decided
   * @param value input in Mexican Peso (MXN)
   */
  private MXNToUSD(value: number) {
    return (value / 18.7); // as of Feb 11, 2020
  }

  /**
   * Convert Acre-Foot (AF) to Cubic Meter (M3)
   * @param value input in acre-foot (AF)
   */
  private AFToM3(value: number) {
    return (value * 1233.48186);
  }

  /**
   * Convert Cubic Meter (M3) to Acre-Foot (AF)
   */
  private M3ToAF(value: number) {
    return (value / 1233.48186);
  }

  /**
   * Convert Tonnes per Acre (t/ac) to Tonnes Per Hectare (t/ha)
   * @param value input in Tonnes per Acre (t/ac)
   */
  private TperACToTperHa(value: number) {
    return (value * 2.47);
  }


  /**
   * Convert Tonnes per hectare (t/ha) to tonnes per acre (t/ac)
   * @param value input in Tonnes per Hectare (t/ha)
   */
  private TperHaToTperAC(value: number) {
    return (value / 2.47);
  }

  /******************************* Base 10 Conversions ****************************** */

  /**
   * Division by a thousand
   * @param value  input any unit
   */
  private DivThousand(value: number) {
    return value / 1000;
  }

  /**
   * Multiply by a thousand
   * @param value input any unit
   */
  private MulThousand(value: number) {
    return value * 1000;
  }

  /**
   * Multiply by 100
   * @param value input any unit
   */
  private MulHundred(value: number) {
    return value * 100;
  }

  /**
   * Divide by 100
   * @param value input in any unit
   */
  private DivHundred(value: number) {
    return value / 100;
  }

  /**
   * Divide by a million
   * @param value input in any unit
   */
  private DivMillion(value: number) {
    return value / 1000000;
  }

  /**
   * Multiply by a million
   * @param value input in any unit
   */
  private MulMillion(value: number) {
    return value * 1000000;
  }

  /******************************* Settings ****************************** */

  /**
   * Sets the input unit language so the translation dictionary is used
   */
  public setLanguage(lang: string) {
    this.lang = lang;
  }

  /**
   * Sets the number of significant figures for the values
   * @param precision number of significant figures
   */
  public setPrecision(precision: number) {
    this.precision = precision;
  }

}

