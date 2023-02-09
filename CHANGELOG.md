# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [2.6.9] - 2023-09-02
### Added
- Fork to SWIM Public
- Database creation and initialization scripts.
- Sample data for SWIM Modeling database with one integrated model.
- Added database sample for swim modeling.
- Model compose stack tested with all services

### Changed
- Readme updates
- Removed UTEP policies
- Removing SWIM project specific pages and features.

## [2.6.8] - 2023-01-30
### Added
- SWIM UI dockerization

### Changed
- Updates in products page
- Project refactoring and structure organization
- removed ngx-json-ld as it was causing build issues and only useful from server side rendering

## [2.6.7] - 2022-12-16
### Added
- New public software products.
- Data section on menu with links to sparql endpoint and swim api docs.
- Link to story map.

## [2.6.6] - 2022-12-05
### Added
- Connection to NLNG Natural Language Generator Service
- Show narrative text on individual outputs (if available)

## [2.6.5] - 2022-11-29
### Added
- CUAHSI Webinar presentation and tutorial video links.
- Dropdown link to study area map on main menu.

## [2.6.4] - 2022-11-04
### Fixed
- My scenarios was not loading for users that were not content managers. The hidden canned scenarios column was not being found.

## [2.6.3] - 2022-10-27
### Fixed
- Widget overlap on summary on the first row.
- Disabled running scenarios from canned scenarios view (hot fix)

## [2.6.2] - 2022-09-10
### Changed
- Changed order of products. Peer reviewed to the top.
- Chaged compatible browsers text on help section.

## [2.6.1] - 2022-09-22
### Added
- Updated publications on model landing pages.
- Award fields on hydroshare form.
- Rights fields on hydroshare form.
- Error and success box on hydroshare form.
- Error handler method for hydroshare responses. 
- Spanish version of hs form.
- SWIM endpoint services for HS metadata (get by hs_id and insert).
### Fixed
- Session alert prompt on guest autologin.
- Commented out calls to NLNG service.
- Summary undefined labels on Hydroeconomic model.

## [2.6.0] - 2022-08-11
### Added
- Hydroshare integration
- Presentations page 
- Forum talk presentation added to presentations
- Publications page with bibtex widget linked to zotero

## [2.5.4] - 2022-02-03
### Added
- Spanish first splash
- English and spanish dive in tutorial.

## [2.5.3] - 2022-22-02
### Changed
- Adjustments first splash

## [2.5.2c] - 2022-21-02
### Changed
- Adjustments first splash

## [2.5.2b] - 2022-18-02
### Added
- First splash tutorial in english

## [2.5.2] - 2022-18-02
### Added
- New SWIM logo.
- First splash page

### Changed
- Style adjustments on frontpage.

### Fixed
- Summary box fixes to load data more dynamically.

## [2.5.1] - 2022-08-02
### Fixed
- Scenarios from shared linked.

## [2.5.0] - 2021-21-12
### Added
- Public release of version.
- Updated labels.

## [2.5.0-beta] - 2021-09-12
### Added
- Integration of Water Balance Model 2.0
- Support for multi-language landing page schematics.
- Model diagrams in spanish.
- Scroll to ranking and theme modal windows.

### Changed
- Size adjustment of line plot dots.
- Updated water balance diagram.
- Updated scenario images.
- Added citation field for scenario images.

### Fixed
- Removed no records error page.
- Fix on summary gauges when at 0 percent.
- Error handling for recommender services.
- Fix on output detail plots.

## [2.4.7] - 2021-27-10
### Added
- Documentation button on mobile tab. 

### Changed
- Updated mobile menu
- Headers of tutorial section

## [2.4.6] - 2021-21-09
### Changed
- Updated SWIM recommender integration.
- Chnages on footer.

## [2.4.5] - 2021-28-06
### Added
- Added semantic context to model landing pages.
- Added package for json-ld appendix.

### Changed
- Guest login mechanism updated.

## [2.4.4] - 2021-16-06
### Added
- Swagger documentation on SWIM API
- Authentication on swagger docs.
- Added swagger to parameter endpoints.
- Added swagger to set endpoints.

### Changed
- Translations and minor updates.

## [2.4.3] - 2021-03-06
### Fixed
- Fixed export input data apperance in table view.

### Added
- Added US gallon to liter conversions.

## [2.4.2] - 2021-30-04
### Fixed
- Scenario descriptions on run were getting cached from precious runs.
- Canned scenario dashboard was empty when previous selected role was on memory.

## [2.4.1] - 2021-01-04
### Fixed
- Sort outputs fro cross compare by variable name.
- Missing roles from public selection.

## [2.4.0] - 2021-02-03
### Added
- Mapping of new recommender service endpoints.
- Implicit feedback with new recommender endpoint
- Explicit feedback capture with local tracing.
- Time projection dialog.

### Changed
- Layout of output details.
- Angular framework upgrade from version 8 to 11.
- Dynamic dashboard based on role recommendations.

## [2.3.0] - 2020-17-12
### Added
- Integration of recommender service complete.
- Added output sorting by recommender suggestion.
- Selection of role when selecting a public or private scenario.

## [2.2.12] - 2020-09-12
### Added
- Added button to project area interactive map on create scenarios workflow.
- Added service calls to recommender system endpoints.

## [2.2.11] - 2020-23-11
### Fixed
- Fixed model description cached from public scenarios.

## [2.2.10] - 2020-29-10
### Added
- Created a permament changelog.

### Changed
- Updated frontend documentation.
- Improved pdfviewer component to receive file name via URL.
- Moved cookie agreement to top left.

### Fixed
- Clean up of model description field when running new scenarios.

## [2.2.9] - 2020-05-10

### Added
- Cross comparison with private user scenarios on the create/view scenario workflow.
- Fetching private scenario listing for cross comparison.

### Fixed
- Bug patch for fetching scenario description for model runs service.

## [2.2.8] - 2020-28-09
### Added
- Link to change password page.
- User password change feature.
- Cross compare features ready with public scenarios only.
- Node route for cross compare scenario fetching.
- Service on frontend for cross compare data.
- Data preparation for compare scenarios component.
- Aggregate pipeline for getting filtered scenarios and outputs on cross compare.

### Fixed
- Registration error for already used email.

## [2.2.7] - 2020-10-09
### Added
- Added REU page.
- Added some missing spanish translations.
- Added reu experience news.
- Scenario selection arrays and pass to parent call.
- Frontend basework for cross model comparison.
- Added permanent scenario name on the view result sections.

### Changed
- Style changes to text on model landing pages.

### Fixed
- Bug fix on user credential login when registering.
- Fixed spanish translation errors.
- Bug fix unit language after paramater change on theme details.

## [2.2.6] - 2020-28-08
### Changed
- Showing yearly timesteps on x axis on charts in theme details and output details. (Temporal Solution).

### Fixed
- Fix on catalog filters only by specific column and not taking into account all columns.

## [2.2.5] - 2020-20-08
### Added
- Sync of autologin with cookie consent.
- Error handling and memory cleanup.
- New error handler on all services and some components.
- Added cookie policy in compliance with GDPR.

## [2.2.4] - 2020-14-08
### Added
- Mark scenario themes used on a previous model run.
- User access level validation before deleting a canned scenario.
- Option to hide dynamic data tools on canned scenarios.
- Canned scenarios can now be removed through the interface.
- Events section on frontpage and usability sessions advertisement.
-  Added invitations for usability testing summer 2020.

### Changed
- Frontend details and spanish translations.
- Added missing spanish translations.
- Updated SWIM privacy policy.

## [2.2.3] - 2020-21-07
### Added
-  Adjustments to local user storage data.

### Changed
- Removed ip log calls.

## [2.2.1] - 2020-14-07
### Fixed
-  Other content fixes.

## [2.2.0] - 2020-13-07
### Added
- Canned scenarios ready for content management user.
- Added insertion of new canned scenarios.
- Create can scenarios dialog window.
- Get all canned scenarios endpoint and service.
- Added mongo connection settings to configuration file.
- Added production connecion for mongoDB SWIM database.

### Fixed
- Fixing some look and feel details.
- Fix on mongoURL connect for private scenario routes.

## [2.1.1] - 2020-17-06
### Added
- Added no record found page.
- Queries of private scenarios.
- Deletion of private scenarios.
- Added authguard for my scenarios.
- Service method for private runs
- Selection of user scenario to be private or public, only on signed in.
- Added Moving Average functionality to output details section.
- Rolling average functionality on the detailed input view.
- Added method to calculate rolling average from number array.

### Changed
- Reduced banner dimension and size.
- Look tweaks on frontpage banner.
- Update on wb balance diagram.

### Fixed
- Fix on runnig flag if model run returns error.
- Fix on unit conversion to return number types and not as strings.
- Bug fix sync slider changes with plots.

## [2.0.11] - 2020-18-05
### Added
- Reset plots along with data reset on input details.
- Unit conversion applied to default parameter values.

### Fixed
Bug fixed: Update input detail plots when table values are changed.

## [2.0.10] - 2020-14-05
### Changed
- page intro fixes and translations

## [2.0.9] - 2020-05-05
### Added
- Event logs and logins with ip address from client.
- IP log with external service api. (Commented).
- Added new table level operations.
- Added table averages calculations with set filters.
- Added summary bar plots with multi-last element values.
- Dynamic sumary gauges now functional.
- Plugins for gauge widgets and preping class for automated calculations.
- Added summary box on view results.
- Model structure for output overview and added gauge chart package.

### Changed
- Summary section improved styling with alignments and responsive boxes.
- Refactored summary catalog structure for spanish labels and better organization.

### Fixed
- Debugged jwt token user data.
- Fixed description sync bug.
- Debugged summary section when executing canned scenarios.
- Fixed production bug for share scenario link. Needed to include locale.

## [2.0.8] - 2020-31-03
### Added
- Added evaporation scenarios on bucket model.
- Added new scenario theme images.
- Translation to spanish of new sections.
- Scalar conversions on theme details.
- Prepping to track scenario themes selected for user scenario.
- Added share popup for public scenarios.
- Historic runs can now be loaded on the user workflow without re-running the model.
- Public scenarios sorted by date in descending order.
- Added endpoint to get complete user scenario by id.
- Public Scenarios Section.
- Added schematic for bucket model.
- Added new model description text for water balance model.
- Frontend - Custom Scenarios Service to fetch metadata listong of model scenarios (executions).
- Added api ping/pong on frontend.
- Node service url to get public user scenarios.
- Logs model execution errors, and better looking error screen.
- Conversion of datetimes added to execution update.
- Execution logger done.
- Added Help Section

### Changed
- Clean up of some section for presentation.
- Improved error handling for SWIM node server.

### Fixed
- Fix on backend date logs.
- Fix on pagination bug. Can now return to the correct page after looking at the details.

## [2.0.7] - 2020-03-03
### Added
- All spanish conversions done.

## [2.0.6] - 2020-02-03
### Added
- Added snackbars and improved guest login.
- Added csv data export for catalogs.
- Error handling on unit conversions and added new entries on the dictionary of units (spanish to english).
- Handle spanish benchmark values dynamically.
- Static text annotated and translated with i18n.
- Terms translation to spanish.
- Configuration for multi-language platform (i18n) internacionalization.
- Translation of the landing page to spanish.
- Adding more conversions functions and on precision.
- Added unit conversions to output details.
- Unit convertions on themes.
- Adding convertions to unit dictionary.

### Changed
- Updated translations for tooltips and placeholders.
- Updated orchestration algorithms from Alex.

### Fixed
- Handle scalar covnertions on input catalog.
- Bug fixing, more testing required and refactor the base 10 function names.

## [2.0.5] - 2020-05-02
### Added
- Alternative if pdfviewer does not show. 
- Added cssi poster 2020 and pdf viewer component.

### Changed
- Darker yellow on charts and some hints for the plot legends.
- Layout adjustments for multiple resolutions.
- Sliders as percent on given inputs, input details tweaks, output details hint box and tweaks.

## [2.0.4] - 2020-31-01
### Added
- Export plot as image, hides button on table view.
- Added button to export plots as Base64Image from canvas.
- Multiple runs of the model and output reset.

### Changed
- Added button to export plots as Base64Image from canvas.

### Fixed
- Fixes redundant event subscriptions to submit scenario. 

## [2.0.3] - 2020-28-01
### Changed
- Hide main navigation on details view (catalogs).
- Footer redesign. Added terms of service and policy agreements.

### Fixed
- Fixes on benchamrk output data plots - was repeating colors.
- Fixed repeated colors on graphs and random mechanisms if the color index becomes out of bounds.

## [2.0.2] - 2020-23-01
### Changed
- Separation of the input catalog and a bunch of ui changes.

## [2.0.1] - 2020-22-01
### Added
- Added color palette for chartjs plots.

### Changed
- Merged customize with input catalog, many other interface updates.
- Working on ui details and fine tuning code.

## [2.0.0] - 2020-09-01
### Added
- Deployment of SWIM 2 Beta into production.





