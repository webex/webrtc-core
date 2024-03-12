# [2.6.0](https://github.com/webex/webrtc-core/compare/v2.5.0...v2.6.0) (2024-03-12)


### Features

* separate API for enabled and muted states ([#72](https://github.com/webex/webrtc-core/issues/72)) ([f4ce41d](https://github.com/webex/webrtc-core/commit/f4ce41d600db48014cd634a1ad0bfa84e99603e7))

# [2.5.0](https://github.com/webex/webrtc-core/compare/v2.4.0...v2.5.0) (2024-02-14)


### Features

* set/create events ([#71](https://github.com/webex/webrtc-core/issues/71)) ([92e01d9](https://github.com/webex/webrtc-core/commit/92e01d90cd70a8b6e1010a006a6f9ce7a44fbbd3))

# [2.4.0](https://github.com/webex/webrtc-core/compare/v2.3.1...v2.4.0) (2024-01-29)


### Features

* add custom method toJSON for _LocalStream ([#70](https://github.com/webex/webrtc-core/issues/70)) ([6ac5ba1](https://github.com/webex/webrtc-core/commit/6ac5ba1a4e156075717c6b31addaa4080e4d1999))

## [2.3.1](https://github.com/webex/webrtc-core/compare/v2.3.0...v2.3.1) (2024-01-19)


### Bug Fixes

* check muted property for mute getter ([#69](https://github.com/webex/webrtc-core/issues/69)) ([f07754c](https://github.com/webex/webrtc-core/commit/f07754c85a159c418b9189134c995859f411279f))

# [2.3.0](https://github.com/webex/webrtc-core/compare/v2.2.3...v2.3.0) (2024-01-10)


### Features

* update effects APIs ([#68](https://github.com/webex/webrtc-core/issues/68)) ([64ac8b6](https://github.com/webex/webrtc-core/commit/64ac8b69af557ee3e01df28681a1fc25dc8bd364))

## [2.2.3](https://github.com/webex/webrtc-core/compare/v2.2.2...v2.2.3) (2023-12-12)


### Bug Fixes

* handle invalid m-line with trailing whitespace ([#67](https://github.com/webex/webrtc-core/issues/67)) ([6f4fbdb](https://github.com/webex/webrtc-core/commit/6f4fbdba50e551c026927ae8f1584556c3c7767c))
* rename error type enum ([#66](https://github.com/webex/webrtc-core/issues/66)) ([cc3473b](https://github.com/webex/webrtc-core/commit/cc3473b3f49a5b3a745d0391efefcfe15b56aed8))

## [2.2.2](https://github.com/webex/webrtc-core/compare/v2.2.1...v2.2.2) (2023-12-11)


### Bug Fixes

* rename WcmeError to WebrtcCoreError ([#65](https://github.com/webex/webrtc-core/issues/65)) ([6a4078b](https://github.com/webex/webrtc-core/commit/6a4078bc276a8826c83caba0683f8f85be0c05b6))

## [2.2.1](https://github.com/webex/webrtc-core/compare/v2.2.0...v2.2.1) (2023-10-12)


### Bug Fixes

* throw error in setLocalDescription if media line is missing codecs ([#63](https://github.com/webex/webrtc-core/issues/63)) ([ec5f257](https://github.com/webex/webrtc-core/commit/ec5f257a25f21f3275bc84de0650981af49f551c))

# [2.2.0](https://github.com/webex/webrtc-core/compare/v2.1.0...v2.2.0) (2023-10-02)


### Features

* add id, readyState, and getAllEffects to stream classes ([#62](https://github.com/webex/webrtc-core/issues/62)) ([62deb74](https://github.com/webex/webrtc-core/commit/62deb74cea2c2ac505bced2f8694679bea570d36))

# [2.1.0](https://github.com/webex/webrtc-core/compare/v2.0.0...v2.1.0) (2023-07-28)


### Features

* add generics to device management ([#61](https://github.com/webex/webrtc-core/issues/61)) ([adf048e](https://github.com/webex/webrtc-core/commit/adf048e44b74303394e732ad840c38adb3d87298))

# [2.0.0](https://github.com/webex/webrtc-core/compare/v1.7.1...v2.0.0) (2023-07-19)


### Features

* convert track-based classes into stream-based classes ([#60](https://github.com/webex/webrtc-core/issues/60)) ([74089af](https://github.com/webex/webrtc-core/commit/74089af9570343002611b59d40897cfa029a131a))


### BREAKING CHANGES

* convert track-based classes into stream-based classes

## [1.7.1](https://github.com/webex/webrtc-core/compare/v1.7.0...v1.7.1) (2023-06-02)


### Bug Fixes

* resolve system audio as null if unavailable ([#54](https://github.com/webex/webrtc-core/issues/54)) ([c90617b](https://github.com/webex/webrtc-core/commit/c90617b8f80430ada8ad76f101f71bd5dc016cb6))

# [1.7.0](https://github.com/webex/webrtc-core/compare/v1.6.3...v1.7.0) (2023-06-02)


### Features

* add support for getting slides audio ([#53](https://github.com/webex/webrtc-core/issues/53)) ([7b9fea4](https://github.com/webex/webrtc-core/commit/7b9fea47bea70ec0281922e5f9bb1f121efa39b6))

## [1.6.3](https://github.com/webex/webrtc-core/compare/v1.6.2...v1.6.3) (2023-05-09)


### Bug Fixes

* keep track of loading effects and dispose them if unrequired after load ([#48](https://github.com/webex/webrtc-core/issues/48)) ([c3e8ebc](https://github.com/webex/webrtc-core/commit/c3e8ebc01897be97cf8819d781f383362a04f4c5))

## [1.6.2](https://github.com/webex/webrtc-core/compare/v1.6.1...v1.6.2) (2023-04-19)


### Bug Fixes

* ci ([#46](https://github.com/webex/webrtc-core/issues/46)) ([b0502e3](https://github.com/webex/webrtc-core/commit/b0502e36d8a5fed490c3f304de70d7398e19e641))
* ci token ([#45](https://github.com/webex/webrtc-core/issues/45)) ([abc7038](https://github.com/webex/webrtc-core/commit/abc703816f8cb95cc5e679d64b86b8fb3bc651b0))

## [1.6.1](https://github.com/webex/webrtc-core/compare/v1.6.0...v1.6.1) (2023-04-18)


### Bug Fixes

* incorrect log ([#44](https://github.com/webex/webrtc-core/issues/44)) ([3e33f79](https://github.com/webex/webrtc-core/commit/3e33f79fc1b6e57bd029000c396c57b08c6057e3))

# [1.6.0](https://github.com/webex/webrtc-core/compare/v1.5.1...v1.6.0) (2023-04-13)


### Features

* add getEffects and fix disposeEffects to be async ([#43](https://github.com/webex/webrtc-core/issues/43)) ([f5117f2](https://github.com/webex/webrtc-core/commit/f5117f231cbe819168e39052707175a9203733c8))

## [1.5.1](https://github.com/webex/webrtc-core/compare/v1.5.0...v1.5.1) (2023-04-07)


### Bug Fixes

* (another) attempt at fixing semantic-release permissions ([#42](https://github.com/webex/webrtc-core/issues/42)) ([bc86e66](https://github.com/webex/webrtc-core/commit/bc86e66093681a6d6f6dff937f38f3c04716dfb1))
* export logger ([#40](https://github.com/webex/webrtc-core/issues/40)) ([7cd4416](https://github.com/webex/webrtc-core/commit/7cd441681f8bb489c8a4c3860f8cd9aed19c80a1))
* fix workflow token ([#41](https://github.com/webex/webrtc-core/issues/41)) ([439c30f](https://github.com/webex/webrtc-core/commit/439c30f5d2bc099e8496318f8811be03ad232771))

# [1.5.0](https://github.com/webex/webrtc-core/compare/v1.4.1...v1.5.0) (2023-03-29)


### Features

* add support for videocontenthint on display tracks ([#39](https://github.com/webex/webrtc-core/issues/39)) ([e4a1bb1](https://github.com/webex/webrtc-core/commit/e4a1bb14868cc6044f9fa0dcb08f1d3b6fbac3b6))

## [1.4.1](https://github.com/webex/webrtc-core/compare/v1.4.0...v1.4.1) (2023-03-27)


### Bug Fixes

* made create*Track() functions generic ([#38](https://github.com/webex/webrtc-core/issues/38)) ([5493d89](https://github.com/webex/webrtc-core/commit/5493d8960f6e92e8706ab15474d7e6b3141ccb20))

# [1.4.0](https://github.com/webex/webrtc-core/compare/v1.3.0...v1.4.0) (2023-03-06)


### Bug Fixes

* update disposeEffects doc ([fa6d58b](https://github.com/webex/webrtc-core/commit/fa6d58b7917e29772167c4933042e444b2864e05))


### Features

* Method named getNumActiveSimulcastLayers & event to LocalTrack for constraints changed ([#35](https://github.com/webex/webrtc-core/issues/35)) ([9298169](https://github.com/webex/webrtc-core/commit/92981694b22ff7a8b9431d351c4a80a53b585a51))
* support applying music mode constraints ([#27](https://github.com/webex/webrtc-core/issues/27)) ([081b8b2](https://github.com/webex/webrtc-core/commit/081b8b23683bbd63c22e597ef88167391a511d51))

# [1.3.0](https://github.com/webex/webrtc-core/compare/v1.2.0...v1.3.0) (2022-12-20)


### Features

* add the api for fetching the connection type ([#20](https://github.com/webex/webrtc-core/issues/20)) ([4e5fe55](https://github.com/webex/webrtc-core/commit/4e5fe55bdf526b82f0d5f930e6d1d9c96c340bbc))

# [1.2.0](https://github.com/webex/webrtc-core/compare/v1.1.1...v1.2.0) (2022-12-16)


### Features

* support for passing the config to the PeerConnection constructor ([#19](https://github.com/webex/webrtc-core/issues/19)) ([e4cc4a8](https://github.com/webex/webrtc-core/commit/e4cc4a8d79b7828ab310c6de6ef4a42dabc54772))

## [1.1.1](https://github.com/webex/webrtc-core/compare/v1.1.0...v1.1.1) (2022-12-06)


### Bug Fixes

* restore the original stream on disposing effects ([#16](https://github.com/webex/webrtc-core/issues/16)) ([981c1de](https://github.com/webex/webrtc-core/commit/981c1dee96f3e54ef76d0c74f9eca8fa0064f7f8))

# [1.1.0](https://github.com/webex/webrtc-core/compare/v1.0.2...v1.1.0) (2022-11-28)


### Features

* add getStats to PeerConnection ([#11](https://github.com/webex/webrtc-core/issues/11)) ([3868f24](https://github.com/webex/webrtc-core/commit/3868f242be84982d87c7a3c8066bb1691d6fd144))

## [1.0.2](https://github.com/webex/webrtc-core/compare/v1.0.1...v1.0.2) (2022-11-18)


### Bug Fixes

* added export for ConnectionState ([#10](https://github.com/webex/webrtc-core/issues/10)) ([7258165](https://github.com/webex/webrtc-core/commit/7258165d32750284e62ca25fcc0762aa86fd0293))

## [1.0.1](https://github.com/webex/webrtc-core/compare/v1.0.0...v1.0.1) (2022-11-15)


### Bug Fixes

* update doc for a force release ([#9](https://github.com/webex/webrtc-core/issues/9)) ([b19c913](https://github.com/webex/webrtc-core/commit/b19c913460fc70a5bb8c205cb37c6e27964e43ed))

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
