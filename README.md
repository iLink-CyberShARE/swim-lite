# SWIM Lite

A full deployment setup of the SWIM 2 User Interface with core features and ready-to-use backend services.   

The SWIM User Interface (Frontend) is a dynamic web application that facilitates interaction with third party scientific modeling software.   

In general terms, the SWIM UI provides a generic workflow for the specification of model scenarios that run on third party modeling software systems. SWIM is envisioned as a platform that suplements model publications and can be used to engage stakeholders into participatory modeling activities.   

The SWIM UI implements original research outcomes for data presentation, model interaction, visualization, and provenance; all of which aid in the understanding of complex scientific models. The research takes into account a wide range of stakeholders that don't necessarily come from a modeling background.    

# Build and Run

This docker container setup will make use of the following ports on the target machine.
Make sure to have the application ports free to use, or change mappings and settings as required.

8081: SWIM Web User Interface (frontend)   
9110: SWIM API service (backend)   
5030: Water Balance Model V2 Python Processor and Model   
3309: Mysql 8 Database Manager   
27018: MongoDB 5 Database Manager   

Settings Files:   
docker-compose.yml: Deployment Workflow, Credentials and Port Mappings.   
src/environments/environments.stage.ts: Webservice connections from the user interface. (Note: Changing this file wil require you to perform a docker build and change the image path to your local machine or docker tag).   

## Dependency Repositories   
SWIM API: [https://github.com/iLink-CyberShARE/swim-api](https://github.com/iLink-CyberShARE/swim-api)   
WBM V2: [https://github.com/iLink-CyberShARE/SWIM-IT/tree/master/Services/Python%20Model%20Processor](https://github.com/iLink-CyberShARE/SWIM-IT/tree/master/Services/Python%20Model%20Processor)

## Option 1: Docker Compose File
1. Download the docker-composer.yml file, mapped volume folders, and create folders missing volume mappings on a save directory.
2. Install Docker and Docker composer on your target machine.   
3. Setup your docker account at: https://www.docker.com/get-started   
4. Configure the docker-composer file with your own credentials. If changing port mappings you will need to rebuild the SWIM-UI image. 
5. Run docker compose: $docker-compose up   
5a. Use -d option on the composer command to run on the background after you have verified correct deployment of the containers. 
6. The SWIM UI will be available at http://localhost:8081

## Option 2: Build Your SWIM-UI Docker Container
1. Download this repository into a folder on your machine.   
2. Install Docker and Docker composer on your target machine.   
3. Setup your docker account at: https://www.docker.com/get-started   
4. Using a command line or terminal navigate to the base path of the project.
5. Configure the environment stage file (/src/environments/environment.stage.ts) as needed. Default setup should work with no modifications unless one of the assigned ports are in use.
6. Build the image: $docker build -t dockeruser/swim-ui:latest .
7. Run the container: $docker run dockeruser/swim-ui
8. The SWIM UI will be available at http://localhost:8081   

Note: All other webservice dependencies will need to be run separately or via docker compose.

## Option 3: Build and Run Natively (Development)
1. Clone repository on target machine.   
2. Install node js v12.16.2 on target machine: https://nodejs.org/en/   
3. Install npm v6.14.4 on target machine: https://www.npmjs.com/   
4. Install the Angular CLI v11.2.1 on target machine: https://angular.io/cli   
4. Download and install dependencies via npm: npm install (dependencies on package.json)   
5. Set the appropiate environment paths for backend and third-party services on src/environments   
6. Development commands:
  -  ng serve --configuration=es => local server (en or es for language) 
  -  npm run start-es or npm run start-en => run locally spanish or english
  -  npm run extract-i18n => extract annotated html for internationalization
  -  npm run build:client-bundles-i18n => build bundles in all languages for production

# Documentation
- https://water.cybershare.utep.edu/resources/docs/en2/architecture/layered-view/
- https://water.cybershare.utep.edu/resources/docs/en2/ui/overview/
- https://water.cybershare.utep.edu/resources/docs/angular/ 

# Contributors
Luis A Garnica Chavira   
Raul Alejandro Vargas Acosta   
Daniel Ornelas   

# Acknowledgements
This material is based upon work supported by the National Science Foundation under Grant No. 1835897. This work was supported by The Agriculture and Food Research Initiative (AFRI) grant no. 2015-68007-23130 from the USDA National Institute of Food and Agriculture. This work used resources from Cyber-ShARE Center of Excellence supported by NSF Grant HDR-1242122. 

## How to cite
If you create products such as publications using SWIM products, it would be great if you add the  following acknowledgement:   

"This work used the Sustainable Water for Integrated Modeling (SWIM) 2.0, which was supported by the National Science Foundation under Grant No. 1835897."  

Please use the following citation for this product:     

Supporting Regional Water Sustainability Decision-Making through Integrated Modeling
Garnica Chavira L., Villanueva-Rosales N., Heyman J., Pennington D., Salas K.
2022 IEEE 8th International Smart Cities Conference, Paphos, Cyprus. September 26-29, 2022.
DOI 10.1109/ISC255366.2022.9922004   

# License 
This software code is licensed under the [GNU GENERAL PUBLIC LICENSE v3.0](./LICENSE-3RD-PARTY.md) and uses third party libraries that are distributed under their own terms (see [LICENSE-3RD-PARTY.md](./LICENSE-3RD-PARTY.md)).

The SWIM interface layout and documentation is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

# Copyright
© 2019-2023 - University of Texas at El Paso (SWIM Project).
