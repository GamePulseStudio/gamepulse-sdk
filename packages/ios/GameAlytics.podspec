Pod::Spec.new do |spec|
  spec.name          = "GameAlytics"
  spec.version       = "2.0.0"
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
  spec.swift_version = "5.0"
  
  spec.source_files = "Sources/**/*.swift"
  spec.frameworks = "Foundation"
  
  spec.requires_arc = true
  
  # Documentation
  spec.documentation_url = "https://docs.gamealytics.com"
  
  # Social media
  spec.social_media_url = "https://twitter.com/gamealytics"
  
  # Cocoapods validation
  spec.pod_target_xcconfig = {
    'SWIFT_VERSION' => '5.0'
  }
end
