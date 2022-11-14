# 1.0.0 (2022-11-14)


### Bug Fixes

* commitlint rules for body ([17d2057](https://github.com/webex/webrtc-core/commit/17d2057a63cd32248e6b865bd268bbc34a25cd23))
* dependent package vulnerability ([#62](https://github.com/webex/webrtc-core/issues/62)) ([803f296](https://github.com/webex/webrtc-core/commit/803f29689e19756757cb1c11f0e4163022edf4dc))
* disable integration tests (temporary) ([#68](https://github.com/webex/webrtc-core/issues/68)) ([75064a4](https://github.com/webex/webrtc-core/commit/75064a4d38f3b10b8e1a1023bcea9ea0240578fc))
* enable sonar with quality gate check as part of build ([#54](https://github.com/webex/webrtc-core/issues/54)) ([ae10580](https://github.com/webex/webrtc-core/commit/ae1058046346b791bd666b5e4a7f35934c0c7adc))
* fix import path ([#27](https://github.com/webex/webrtc-core/issues/27)) ([eee0d88](https://github.com/webex/webrtc-core/commit/eee0d884d60c3bdac508c8da7116f70f1d8cb448))
* fix the way we do exports ([#19](https://github.com/webex/webrtc-core/issues/19)) ([cc8cc85](https://github.com/webex/webrtc-core/commit/cc8cc858cdc9f76248bb2848ead4d71cef0aa6ce))
* handle underlying track being undefined in addTransceiver ([#35](https://github.com/webex/webrtc-core/issues/35)) ([b9bbca6](https://github.com/webex/webrtc-core/commit/b9bbca6aec4bfb8f07e9272dd227b384bfff753d))
* hookup cspell and eslint for lint-staged ([#16](https://github.com/webex/webrtc-core/issues/16)) ([ad42e8b](https://github.com/webex/webrtc-core/commit/ad42e8b92c1f7dfc8bee844790b91c747f860b57))
* make track class abstract and ensure correct track import path ([#21](https://github.com/webex/webrtc-core/issues/21)) ([3fdf38c](https://github.com/webex/webrtc-core/commit/3fdf38cabb73a406277e52da38be40d18895e619))
* media-stream-track param no longer optional ([#31](https://github.com/webex/webrtc-core/issues/31)) ([bf49615](https://github.com/webex/webrtc-core/commit/bf49615ae54eb4ded4550a95845ddb075a222d95)), closes [#33](https://github.com/webex/webrtc-core/issues/33)
* release initial package on @webex/webrt-core ([d359d77](https://github.com/webex/webrtc-core/commit/d359d77fe9665f43d1ccee53e17d4e26b343f717))
* remove blank testbed until needed and correct readme steps ([#17](https://github.com/webex/webrtc-core/issues/17)) ([e31de4f](https://github.com/webex/webrtc-core/commit/e31de4f175a8cf7d885a6d5a78e6ae5db1211f57))
* remove error logs ([#44](https://github.com/webex/webrtc-core/issues/44)) ([8a3817e](https://github.com/webex/webrtc-core/commit/8a3817e0d61ef7cdbc604910a8da02042a0c5e7c))
* remove redundant git remote ([#52](https://github.com/webex/webrtc-core/issues/52)) ([b6c2d33](https://github.com/webex/webrtc-core/commit/b6c2d33c738f30dd2c8f6108f36f0ddfde654d6c))
* sonar fixes ([#56](https://github.com/webex/webrtc-core/issues/56)) ([6e7ce8a](https://github.com/webex/webrtc-core/commit/6e7ce8aba3c23b7dfe58b73954fe8087a7debe77))
* support ice gathering already being complete in getLocalDescriptionWithIceCandidates ([#40](https://github.com/webex/webrtc-core/issues/40)) ([e22429a](https://github.com/webex/webrtc-core/commit/e22429af17460bfe9ada52ecb6208bb506a8d3b1))
* update adapterjs ([#70](https://github.com/webex/webrtc-core/issues/70)) ([ce6a151](https://github.com/webex/webrtc-core/commit/ce6a151f0d4c0e6a97db8489bf455a2067bf872d))
* update new npm org and registry ([#57](https://github.com/webex/webrtc-core/issues/57)) ([21b16f5](https://github.com/webex/webrtc-core/commit/21b16f57edf0d144a15f206170d55679755a008c))
* update node to use v16 ([#67](https://github.com/webex/webrtc-core/issues/67)) ([4ea99a8](https://github.com/webex/webrtc-core/commit/4ea99a8bbfb0aafe19658ff28de1d3aadaca6b6e))


### Features

* add getter for remote description ([#66](https://github.com/webex/webrtc-core/issues/66)) ([021b771](https://github.com/webex/webrtc-core/commit/021b771cd7bf3a85bf327e848f1dfebd0c3a0fcc))
* add getunderlyingrtcpeerconnection method on peerconnection class ([#64](https://github.com/webex/webrtc-core/issues/64)) ([5abb6be](https://github.com/webex/webrtc-core/commit/5abb6bec5a340df1666bd366934df5106649847d))
* add some more peer connection functionality ([#34](https://github.com/webex/webrtc-core/issues/34)) ([2058263](https://github.com/webex/webrtc-core/commit/2058263e380fa5c65e13e074ad083303d3ae1f65))
* add support for creating an rtcdatachannel ([#15](https://github.com/webex/webrtc-core/issues/15)) ([66d88b2](https://github.com/webex/webrtc-core/commit/66d88b244fe8b33426240ca89a34ec594894a159))
* added connection state handling ([#8](https://github.com/webex/webrtc-core/issues/8)) ([0c7c7e0](https://github.com/webex/webrtc-core/commit/0c7c7e01cd4074e2d089201060c738c01091f498))
* enhance browser support ([#59](https://github.com/webex/webrtc-core/issues/59)) ([3e87bac](https://github.com/webex/webrtc-core/commit/3e87bac0a2321b8db988355d4573a8bc81afed28))
* events object on local-track class ([#24](https://github.com/webex/webrtc-core/issues/24)) ([53b4068](https://github.com/webex/webrtc-core/commit/53b40681ecf9f3dead9b9888fa7cfa6b52151b5f))
* export the datachannel options type ([#60](https://github.com/webex/webrtc-core/issues/60)) ([8c62610](https://github.com/webex/webrtc-core/commit/8c62610b78088ec839f530ca7f478f81b3f959db))
* expose checkdevicepermissions method ([#65](https://github.com/webex/webrtc-core/issues/65)) ([41ed515](https://github.com/webex/webrtc-core/commit/41ed51577e6548322192bd76c8a136e3b6a616da))
* import webrtc-adapter ([#69](https://github.com/webex/webrtc-core/issues/69)) ([7b3834f](https://github.com/webex/webrtc-core/commit/7b3834f1bec0a3917e9c049c5a009a9086655b1f))
* migrating the wcme track to webrtc core ([bdee8c6](https://github.com/webex/webrtc-core/commit/bdee8c6adb53e68451d1f1347ce761e42162e167))
* peer connection events; helper functions ([#23](https://github.com/webex/webrtc-core/issues/23)) ([7fa6727](https://github.com/webex/webrtc-core/commit/7fa67270977f204463a3c005b8ed7ec2157698f7))

# 1.0.0 (2022-10-14)


### Bug Fixes

* commitlint rules for body ([17d2057](https://github.com/webex/webrtc-core/commit/17d2057a63cd32248e6b865bd268bbc34a25cd23))
* dependent package vulnerability ([#62](https://github.com/webex/webrtc-core/issues/62)) ([803f296](https://github.com/webex/webrtc-core/commit/803f29689e19756757cb1c11f0e4163022edf4dc))
* disable integration tests (temporary) ([#68](https://github.com/webex/webrtc-core/issues/68)) ([75064a4](https://github.com/webex/webrtc-core/commit/75064a4d38f3b10b8e1a1023bcea9ea0240578fc))
* enable sonar with quality gate check as part of build ([#54](https://github.com/webex/webrtc-core/issues/54)) ([ae10580](https://github.com/webex/webrtc-core/commit/ae1058046346b791bd666b5e4a7f35934c0c7adc))
* fix import path ([#27](https://github.com/webex/webrtc-core/issues/27)) ([eee0d88](https://github.com/webex/webrtc-core/commit/eee0d884d60c3bdac508c8da7116f70f1d8cb448))
* fix the way we do exports ([#19](https://github.com/webex/webrtc-core/issues/19)) ([cc8cc85](https://github.com/webex/webrtc-core/commit/cc8cc858cdc9f76248bb2848ead4d71cef0aa6ce))
* handle underlying track being undefined in addTransceiver ([#35](https://github.com/webex/webrtc-core/issues/35)) ([b9bbca6](https://github.com/webex/webrtc-core/commit/b9bbca6aec4bfb8f07e9272dd227b384bfff753d))
* hookup cspell and eslint for lint-staged ([#16](https://github.com/webex/webrtc-core/issues/16)) ([ad42e8b](https://github.com/webex/webrtc-core/commit/ad42e8b92c1f7dfc8bee844790b91c747f860b57))
* make track class abstract and ensure correct track import path ([#21](https://github.com/webex/webrtc-core/issues/21)) ([3fdf38c](https://github.com/webex/webrtc-core/commit/3fdf38cabb73a406277e52da38be40d18895e619))
* media-stream-track param no longer optional ([#31](https://github.com/webex/webrtc-core/issues/31)) ([bf49615](https://github.com/webex/webrtc-core/commit/bf49615ae54eb4ded4550a95845ddb075a222d95)), closes [#33](https://github.com/webex/webrtc-core/issues/33)
* release initial package on @webex/webrt-core ([d359d77](https://github.com/webex/webrtc-core/commit/d359d77fe9665f43d1ccee53e17d4e26b343f717))
* remove blank testbed until needed and correct readme steps ([#17](https://github.com/webex/webrtc-core/issues/17)) ([e31de4f](https://github.com/webex/webrtc-core/commit/e31de4f175a8cf7d885a6d5a78e6ae5db1211f57))
* remove error logs ([#44](https://github.com/webex/webrtc-core/issues/44)) ([8a3817e](https://github.com/webex/webrtc-core/commit/8a3817e0d61ef7cdbc604910a8da02042a0c5e7c))
* remove redundant git remote ([#52](https://github.com/webex/webrtc-core/issues/52)) ([b6c2d33](https://github.com/webex/webrtc-core/commit/b6c2d33c738f30dd2c8f6108f36f0ddfde654d6c))
* sonar fixes ([#56](https://github.com/webex/webrtc-core/issues/56)) ([6e7ce8a](https://github.com/webex/webrtc-core/commit/6e7ce8aba3c23b7dfe58b73954fe8087a7debe77))
* support ice gathering already being complete in getLocalDescriptionWithIceCandidates ([#40](https://github.com/webex/webrtc-core/issues/40)) ([e22429a](https://github.com/webex/webrtc-core/commit/e22429af17460bfe9ada52ecb6208bb506a8d3b1))
* update adapterjs ([#70](https://github.com/webex/webrtc-core/issues/70)) ([ce6a151](https://github.com/webex/webrtc-core/commit/ce6a151f0d4c0e6a97db8489bf455a2067bf872d))
* update new npm org and registry ([#57](https://github.com/webex/webrtc-core/issues/57)) ([21b16f5](https://github.com/webex/webrtc-core/commit/21b16f57edf0d144a15f206170d55679755a008c))
* update node to use v16 ([#67](https://github.com/webex/webrtc-core/issues/67)) ([4ea99a8](https://github.com/webex/webrtc-core/commit/4ea99a8bbfb0aafe19658ff28de1d3aadaca6b6e))


### Features

* add getter for remote description ([#66](https://github.com/webex/webrtc-core/issues/66)) ([021b771](https://github.com/webex/webrtc-core/commit/021b771cd7bf3a85bf327e848f1dfebd0c3a0fcc))
* add getunderlyingrtcpeerconnection method on peerconnection class ([#64](https://github.com/webex/webrtc-core/issues/64)) ([5abb6be](https://github.com/webex/webrtc-core/commit/5abb6bec5a340df1666bd366934df5106649847d))
* add some more peer connection functionality ([#34](https://github.com/webex/webrtc-core/issues/34)) ([2058263](https://github.com/webex/webrtc-core/commit/2058263e380fa5c65e13e074ad083303d3ae1f65))
* add support for creating an rtcdatachannel ([#15](https://github.com/webex/webrtc-core/issues/15)) ([66d88b2](https://github.com/webex/webrtc-core/commit/66d88b244fe8b33426240ca89a34ec594894a159))
* enhance browser support ([#59](https://github.com/webex/webrtc-core/issues/59)) ([3e87bac](https://github.com/webex/webrtc-core/commit/3e87bac0a2321b8db988355d4573a8bc81afed28))
* events object on local-track class ([#24](https://github.com/webex/webrtc-core/issues/24)) ([53b4068](https://github.com/webex/webrtc-core/commit/53b40681ecf9f3dead9b9888fa7cfa6b52151b5f))
* export the datachannel options type ([#60](https://github.com/webex/webrtc-core/issues/60)) ([8c62610](https://github.com/webex/webrtc-core/commit/8c62610b78088ec839f530ca7f478f81b3f959db))
* expose checkdevicepermissions method ([#65](https://github.com/webex/webrtc-core/issues/65)) ([41ed515](https://github.com/webex/webrtc-core/commit/41ed51577e6548322192bd76c8a136e3b6a616da))
* import webrtc-adapter ([#69](https://github.com/webex/webrtc-core/issues/69)) ([7b3834f](https://github.com/webex/webrtc-core/commit/7b3834f1bec0a3917e9c049c5a009a9086655b1f))
* migrating the wcme track to webrtc core ([bdee8c6](https://github.com/webex/webrtc-core/commit/bdee8c6adb53e68451d1f1347ce761e42162e167))
* peer connection events; helper functions ([#23](https://github.com/webex/webrtc-core/issues/23)) ([7fa6727](https://github.com/webex/webrtc-core/commit/7fa67270977f204463a3c005b8ed7ec2157698f7))



### Bug Fixes

* commitlint rules for body ([17d2057](https://github.com/webex/webrtc-core/commit/17d2057a63cd32248e6b865bd268bbc34a25cd23))


### Features

* migrating the wcme track to webrtc core ([bdee8c6](https://github.com/webex/webrtc-core/commit/bdee8c6adb53e68451d1f1347ce761e42162e167))

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
