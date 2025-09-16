Pod::Spec.new do |spec|
  spec.name          = "GameAlytics"
  spec.version = "2.0.8"
  spec.summary       = "GameAlytics SDK for iOS - Cross-platform analytics for game developers"
  spec.description   = <<-DESC
    A modern, cross-platform analytics SDK for game developers with a static singleton pattern 
    and fluent builder API for maximum developer experience. Features type-safe event tracking, 
    automatic device information collection, and performance optimization.
  DESC
  spec.homepage     = "https://github.com/gamealytics/gamealytics-sdk"
  spec.license      = { :type => "MIT", :file => "LICENSE" }
  spec.author       = { "GameAlytics Team" => "support@gamealytics.com" }
  spec.source       = { :git => "https://github.com/gamealytics/gamealytics-sdk.git", :tag => "v#{spec.version}" }
  
  spec.ios.deployment_target = "12.0"
  spec.platform = :ios, "12.0"
  spec.swift_version = "5.0"
  
  spec.source_files = "Sources/**/*.swift"
  spec.frameworks = "Foundation"
  
  # Ensure proper validation settings
  spec.pod_target_xcconfig = {
    'SWIFT_VERSION' => '5.0',
    'IPHONEOS_DEPLOYMENT_TARGET' => '12.0'
  }
  
  spec.requires_arc = true
  
  # Documentation
  spec.documentation_url = "https://github.com/gamealytics/gamealytics-sdk/tree/main/packages/ios"
  
  # Social media
  spec.social_media_url = "https://twitter.com/gamealytics"
end
