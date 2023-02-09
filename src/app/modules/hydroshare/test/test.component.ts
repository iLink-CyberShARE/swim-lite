import { Component, OnInit } from "@angular/core";
import { HydroShareService } from "../hydroshare.service";
import { Award } from "../models/award.model";
import { Contributor } from "../models/contributor.model";
import { FileMeta } from "../models/filemeta.model";

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.css"],
})
export class TestComponent implements OnInit {
  constructor(private hydroshareService: HydroShareService) {}

  ngOnInit() {

  }

  login() {
    // checks user information
    this.hydroshareService.fetchUserInfo();
  }

  logout() {
    this.hydroshareService.removeCredentials();
  }

  getResourceMeta() {
      const resource_id = '0f5159d53a85459085c63a2e8efc85f5';
      this.hydroshareService.fetchResourceMeta(resource_id);
  }

  createResource() {

    const title = "Testing a base resource creation";
    const abstract = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    const keywords = ["one", "two", "three"];

    this.hydroshareService.createBaseResource(title, abstract, keywords);

  }

  updateResource() {

    /** Get the current resource */
    const resource = this.hydroshareService.getLoadedResource();

    /** Add an award */
    const award: Award = {
       funding_agency_name: 'National Science Foundation',
       title: 'ELEMENTS: DATA: HDR: SWIM to a Sustainable Water Future',
       number: '1835897'
    };
    let awards: Array<Award> = [];
    awards.push(award);
    resource.awards = awards;

    /* Add a contributor */
    const contributor: Contributor = {
      name: 'Juan Perez',
      organization: 'NMSU',
      email: 'juanp43@utep.edu'
    };
    let contributors: Array<Contributor> = [];
    contributors.push(contributor);
    resource.contributors = contributors;


    this.hydroshareService.updateResource(resource);

  }

  uploadFile() {

    const file_name = "test_scenario.json"

    // TODO: change this for a swim scenario to test out
    const payload: FileMeta = {
      file_name: "test_scenario.json",
      url: "http://ontology.cybershare.utep.edu/swim/test_scenario.json",
      size: 138334,
      content_type: "application/json",
      logical_file_type: "JSON",
      modified_time: "2022-04-11T14:59:54.881Z",
      checksum: "0d3fee7ec9a41e2a83b896f0af3962b5"
    }

    this.hydroshareService.uploadSingleJSON(file_name, payload);

  }


}
