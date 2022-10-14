# [1.7.0](https://github.com/webex/webrtc-core/compare/v1.6.1...v1.7.0) (2022-10-14)


### Bug Fixes

* commitlint rules for body ([17d2057](https://github.com/webex/webrtc-core/commit/17d2057a63cd32248e6b865bd268bbc34a25cd23))


### Features

* migrating the wcme track to webrtc core ([bdee8c6](https://github.com/webex/webrtc-core/commit/bdee8c6adb53e68451d1f1347ce761e42162e167))

### Bug Fixes
* update adapterjs
* disable integration tests (temporary) 
* update node to use v16 
* dependent package vulnerability
* update new npm org and registry 
* update new npm org and registry 
* sonar fixes
* enable sonar with quality gate check as part of build 
* remove error logs
* remove redundant git remote
* fix import path 
* fix the way we do exports 
* handle underlying track being undefined in addTransceiver 
* hookup cspell and eslint for lint-staged 
* make track class abstract and ensure correct track import path 
* media-stream-track param no longer optional
* remove blank testbed until needed and correct readme steps 
* support ice gathering already being complete in getLocalDescriptionWithIceCandidates


### Features
* import webrtc-adapter
* add getter for remote description
* expose checkdevicepermissions method 
* add getunderlyingrtcpeerconnection method on peerconnection class 
* enhance browser support 
* export the datachannel options type
* add support for creating an rtcdatachannel
* add some more peer connection functionality
* events object on local-track class
* peer connection events; helper functions
