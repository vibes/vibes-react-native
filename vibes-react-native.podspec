require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "vibes-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "15.6" }
  s.source       = { :git => "https://github.com/vibes/vibes-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "React-Core"
      # does not have that version, the app Podfile must pin git:
  #   pod 'VibesPush', :git => 'https://github.com/vibes/push-sdk-ios.git', :tag => 'VERSION'
  # If CocoaPods trunk does not have this version, add to the app Podfile:
  #   pod 'VibesPush', :git => 'https://github.com/vibes/push-sdk-ios.git', :tag => '5.0.1'
  s.dependency "VibesPush", "5.0.1"
end
