import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { UserScenario } from "src/app/models/user-scenario";
import { CustomScenariosService } from "src/app/services/custom-scenarios.service";
import { Resource } from "src/app/modules/hydroshare/models/resource.model";
import { HydroShareService } from "src/app/modules/hydroshare/hydroshare.service";
import { mergeMap } from "rxjs/operators";
import { Subscription } from "rxjs";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { Contributor } from "src/app/modules/hydroshare/models/contributor.model";
import { Award } from "src/app/modules/hydroshare/models/award.model";
import { Right } from "src/app/modules/hydroshare/models/right.model";
import { Publisher } from "src/app/modules/hydroshare/models/publisher.model";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-hs-form",
  templateUrl: "./hs-form.component.html",
  styleUrls: ["./hs-form.component.css"],
})
export class HsFormComponent implements OnInit {
  public scenarioID: string;
  private scenarioObj: UserScenario;

  public hsResource: Resource = {
    title: "",
    abstract: "",
    resource_type: "",
    subjects: [],
  };

  /** flags */
  public isPublished = false;
  public contributors = false;
  public awards = false;
  public publishers = false;
  public rights = false;
  public isError = false;
  public isSuccess = false;

  /** temp variables */
  public errorMessages = [];
  private tempResourceID = "";

  /** async subscriptions */
  private hsResourceSubscription: Subscription;

  /** Loading widget activation flag */
  public isLoading = false;
  public loadingLabel = "";

  /** Keywords widget attributes */
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private _route: ActivatedRoute,
    private _customScenariosService: CustomScenariosService,
    private _hydroshareService: HydroShareService
  ) {}

  ngOnInit(): void {
    this._route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("scenarioID")) {
        this.scenarioID = paramMap.get("scenarioID");
        this.prepareComponent();
      } else {
        // do a redirect here to one of the error pages
        console.log("Missing scenario identifier.");
      }
    });
  }

  /**
   * Load a SWIM user scenario from the modeling database.
   */
  private prepareComponent() {
    // set loading widget
    this.isLoading = true;
    this.loadingLabel = "Loading SWIM scenario...";

    this._customScenariosService.GetScenario(this.scenarioID).subscribe(
      (response) => {
        this.scenarioObj = response.result;
        // console.log(this.scenarioObj); // for debug
        // this.ResourceUpdateSubscribe();
        this._hydroshareService.clearResource();
        this.initializeComponentResource();
        this.loadingLabel = "";
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        console.log(error);
      }
    );
  }

  /**
   * Pre-fill resources with metadata from SWIM scenario
   */
  private initializeComponentResource() {
    this.hsResource = {
      title: this.scenarioObj.name,
      abstract: this.scenarioObj.description,
      resource_type: "CompositeResource",
      subjects: [],
    };
  }

  /**
   * Perform HS resource submission with all elements synchonously
   */
  public onSubmit(form: NgForm) {

    if (form.invalid) {
      this.errorMessages = ['Incorrect form field values'];
      this.isError = true;
      return;
    }

    this.errorMessages = [];
    this.isSuccess = false;
    this.isError = false;
    this.createResource();
  }

  /**
   * Perform a metadata update to the currently loaded HS resource
   */
  public onUpdate() {
    this.errorMessages = [];
    this.isSuccess = false;
    this.isError = false;
    this.updateResource();
  }

  /**
   * Updates a resource that is already available on HS
   */
  private updateResource() {
    this.isLoading = true;
    this.loadingLabel = "Updating HS resource...";

    this._hydroshareService.updateResource(this.hsResource).subscribe(
      () => {
        console.log("HS update completed successfully.");
        this.hsResource = this._hydroshareService.getLoadedResource();
        this.isLoading = false;
        this.loadingLabel = "";
        this.isSuccess = true;
      },
      (error) => {
        this.isLoading = false;
        this.loadingLabel = "";
        this.errorMessages = this.handleErrorMessages(error);
        this.isError = true;
      }
    );
  }

  /**
   * Perform a resource creation api call chain.
   * Create base resource, add additional metadata, upload swim scenario
   */
  private createResource() {
    this.isLoading = true;
    this.loadingLabel = "Creating HS resource...";
    this._hydroshareService
      .createBaseResource(
        this.hsResource.title,
        this.hsResource.abstract,
        this.hsResource.subjects
      )
      .pipe(
        mergeMap(() =>
          this._hydroshareService.uploadSingleJSON(
            "scenario_" + this.scenarioID + ".json",
            this.scenarioObj
          )
        )
      )
      .pipe(
        mergeMap(() => this._hydroshareService.updateResource(this.hsResource))
      )
        .subscribe(
        () => {
          console.log("HS Resource Chain executed successfully.");
          this.hsResource = this._hydroshareService.getLoadedResource();
          this._customScenariosService.InsertHSMeta(this.scenarioID, this.hsResource.resource_id, this.hsResource.url, this.hsResource.resource_type);
          this.isPublished = true;
          this.isSuccess = true;
          this.isLoading = false;
          this.loadingLabel = "";
        },
        (error) => {
          this.isLoading = false;
          this.loadingLabel = "";
          this.errorMessages = this.handleErrorMessages(error);
          this.isError = true;
          // delete temp resource on error
          this.deleteResource();
        }
      );
  }

  /**
   * Dynamic form objects
   */

  /**
   * Adds a contributor field set to the form
   */
  public addContributor() {
    console.log("Adding Contributor...");
    if (this.hsResource.contributors == null) {
      this.hsResource.contributors = new Array();
    }
    const entry: Contributor = {
      name: "",
      email: "",
      address: "",
      organization: "",
    };
    this.hsResource.contributors.push(entry);
    this.contributors = true;
    // console.log(this.hsResource);
  }

  /**
   * Removes the last contributor field set from the form
   */
  public removeContributor() {
    this.hsResource.contributors.pop();
    if (this.hsResource.contributors.length == 0) {
      this.contributors = false;
    }
  }

  /**
   * Adds an award field set to the form
   */
  public addAward() {
    console.log("Adding Award...");
    if (this.hsResource.awards == null) {
      this.hsResource.awards = new Array();
    }
    const entry: Award = {
      funding_agency_name: "",
      title: "",
      number: "",
      funding_agency_url: "",
    };
    this.hsResource.awards.push(entry);
    this.awards = true;
    // console.log(this.hsResource);
  }

  /**
   * Removes an award field set from the form
   */
  public removeAward() {
    this.hsResource.awards.pop();
    if (this.hsResource.awards.length == 0) {
      this.contributors = false;
    }
  }

  /**
   * Adds a publisher field set to the form
   */
  public addPublisher() {
    console.log("Adding a publisher...");
    const entry: Publisher = {
      name: "",
      url: "",
    };
    this.hsResource.publisher = entry;
    this.publishers = true;
  }

  /**
   * Removes a publisher field set from the form
   */
  public removePublisher() {
    delete this.hsResource.publisher;
    this.publishers = false;
  }

  /**
   * Adds a right field set to the form
   */
  public addRight() {
    console.log("Adding right...");
    const entry: Right = {
      statement: "",
      url: "",
    };
    this.hsResource.rights = entry;
    this.rights = true;
  }

  /**
   * Removes a right field set from the form
   */
  public removeRight() {
    delete this.hsResource.rights;
    this.rights = false;
  }

  /**
   * Chips widget methods
   */

  /**
   * Add a keyword to the list
   * @param event
   */
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || "").trim()) {
      this.hsResource.subjects.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }

    // console.log(this.hsResource.keywords); // for debug
  }

  /**
   * remove a keyword from the list
   * @param keyword
   */
  remove(keyword: string): void {
    const index = this.hsResource.subjects.indexOf(keyword);

    if (index >= 0) {
      this.hsResource.subjects.splice(index, 1);
    }

    // console.log(this.hsResource.subjects); // for debug
  }

  /* Subscriptions */

  /**
   * Subscribe to changes on the HS resource service
   */
  private ResourceUpdateSubscribe() {
    this.hsResourceSubscription = this._hydroshareService
      .getResourceUpdateListener()
      .subscribe((updatedResource: Resource) => {
        this.hsResource = updatedResource;
        console.log("HS resource was updated!");
        // console.log(this.hsResource); // for debug
      });
  }

  /**
   * Handle error responses from Hydroshare
   * @param error a possible array of error messages received from provider
   * @returns an array of error messages
   */
  private handleErrorMessages(error) {
    let defaultMessages = ["Undefined error occured =("];

    // TODO: log this on this on the SWIM database

    if (typeof error.error === "undefined") return defaultMessages;
    if (typeof error.error[0] !== "undefined" && error.error.length > 0) {
      return error.error;
    }

    return defaultMessages;
  }

  /**
   * Call to delete a hydroshare resource
   */
  private deleteResource() {
    console.log("Deleting HS Resource...");
    this._hydroshareService.deleteResource();
  }


  /**
   * Delete resource from form with alert
   */
  public onDeleteResource() {
    const answer = window.confirm('Are you sure you want to delete this hydroshare resource?');
    if (answer){
      this.isLoading = true;
      this.loadingLabel = "Deleting Resource..."
      this.deleteResource();
      // reload this page
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  }

  /**
   * Prevent anchored subscriptions
   */
  ngOnDestroy() {
    if (typeof this.hsResourceSubscription !== "undefined") {
      this.hsResourceSubscription.unsubscribe();
    }
  }
}
