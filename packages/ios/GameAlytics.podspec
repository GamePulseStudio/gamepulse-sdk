Pod::Spec.new do |spec|
  spec.name          = "GameAlytics"
  spec.version       = "2.0.14"
  spec.summary       = "Cross-platform game analytics SDK for iOS with fluent API"
  spec.description   = <<-DESC
    GameAlytics iOS SDK provides comprehensive game analytics tracking with a modern fluent API design.
    Features include cross-platform support, automatic device information collection, event batching,
    offline support, and real-time analytics dashboard integration. Perfect for iOS game developers.
  DESC
  spec.homepage      = "https://github.com/gamealytics/gamealytics-sdk"
  spec.license       = { :type => "MIT", :file => "LICENSE" }
  spec.author        = { "GameAlytics" => "support@gamealytics.com" }
  spec.source        = { :git => "https://github.com/gamealytics/gamealytics-sdk.git", :tag => "#{spec.version}" }
  
  spec.ios.deployment_target = "12.0"
  spec.platform = :ios, "12.0"
  spec.swift_version = "5.0"
  
  spec.source_files = "packages/ios/Sources/**/*.swift"
  spec.exclude_files = "packages/ios/Sources/**/Info.plist"
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
