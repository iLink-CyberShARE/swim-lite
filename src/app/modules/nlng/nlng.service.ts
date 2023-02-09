import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { Request } from "./request.model";

/** NLNG Service URL */
const SWIM_NLNG = environment.NLNGWebservice;

@Injectable({
  providedIn: "root",
})
export class NlngService {
  constructor(private http: HttpClient) {}

  /**
   * Request a narrative text from the SWIM NLNG generator service.
   * @param outputNarrativeReq model output request payload
   */
  getOutputNarratives(outputNarrativeReq: Request) {
    console.log("Requesting output narrative...");

    const endpoint = SWIM_NLNG + "/output"

    return this.http.post<any>(endpoint, outputNarrativeReq);
  }
}
