import { Component, OnInit } from '@angular/core';
import { faBalanceScale} from '@fortawesome/free-solid-svg-icons';
import { ModelCatalogService } from 'src/app/services/model-catalog.service';

/**
 * Water Balance Model Introduction Page
 */
@Component({
  selector: 'app-wb-intro',
  templateUrl: './wb-landing.component.html',
  styleUrls: ['./wb-landing.component.css']
})
export class WB2LandingComponent implements OnInit {

  faBalanceScale = faBalanceScale;

  /** Model identifier for Water Balance Model */
  modelId = '7b7ac93638f711ec8d3d0242';

  /** declare empty schema */
  schema = {};

  /**
   * Class constructor
   */
  constructor(
    private modelService: ModelCatalogService
  ) {}

  ngOnInit() {
    this.modelService.getModel(this.modelId).subscribe((modelmeta: any) => {
      this.schema = modelmeta.result[0];
      this.schema['@context'] = modelmeta['@context'];
    });
  }

}
