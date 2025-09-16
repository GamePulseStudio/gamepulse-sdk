using UnityEngine;
using UnityEditor;
using System.IO;

namespace GameAlytics.Editor
{
    /// <summary>
    /// Unity Editor script to export GameAlytics package
    /// </summary>
    public class GameAnalyticsPackageExporter : EditorWindow
    {
        private const string PACKAGE_NAME = "GameAlytics.unitypackage";
        private const string PACKAGE_ROOT = "Assets/GameAlytics";
        
        [MenuItem("GameAlytics/Export Package", priority = 1)]
        public static void ExportPackage()
        {
            string exportPath = EditorUtility.SaveFilePanel(
                "Export GameAlytics Package",
                "",
                PACKAGE_NAME,
                "unitypackage"
            );

            if (!string.IsNullOrEmpty(exportPath))
            {
                string[] assetPaths = GetAssetPaths();
                
                AssetDatabase.ExportPackage(
                    assetPaths,
                    exportPath,
                    ExportPackageOptions.Recurse | ExportPackageOptions.IncludeDependencies
                );
                
                Debug.Log($"GameAlytics package exported to: {exportPath}");
                EditorUtility.DisplayDialog(
                    "Export Complete",
                    $"GameAlytics package has been exported to:\n{exportPath}",
                    "OK"
                );
            }
        }

        [MenuItem("GameAlytics/About", priority = 100)]
        public static void ShowAbout()
        {
            EditorUtility.DisplayDialog(
                "GameAlytics Unity SDK",
                "GameAlytics Unity SDK v2.0.15\\n\\n" +
                "A comprehensive analytics SDK for Unity games.\n\n" +
                "Features:\n" +
                "• Cross-platform support\n" +
                "• Fluent API design\n" +
                "• Event batching and queuing\n" +
                "• Real-time analytics\n" +
                "• Comprehensive event categories\n\n" +
                "For support: support@gamealytics.com",
                "OK"
            );
        }

        private static string[] GetAssetPaths()
        {
            if (!Directory.Exists(PACKAGE_ROOT))
            {
                Debug.LogError($"GameAlytics package directory not found: {PACKAGE_ROOT}");
                return new string[0];
            }

            return new string[] { PACKAGE_ROOT };
        }

        /// <summary>
        /// Validate GameAlytics package structure
        /// </summary>
        [MenuItem("GameAlytics/Validate Package Structure", priority = 50)]
        public static void ValidatePackageStructure()
        {
            bool isValid = true;
            string report = "GameAlytics Package Structure Validation:\n\n";

            // Check main directories
            string[] requiredDirectories = {
                "Assets/GameAlytics/Scripts",
                "Assets/GameAlytics/Examples",
                "Assets/GameAlytics/Editor",
                "Assets/GameAlytics/Documentation"
            };

            foreach (string dir in requiredDirectories)
            {
                if (Directory.Exists(dir))
                {
                    report += $"✓ {dir}\n";
                }
                else
                {
                    report += $"✗ {dir} (Missing)\n";
                    isValid = false;
                }
            }

            // Check main script file
            string mainScript = "Assets/GameAlytics/Scripts/GameAlytics.cs";
            if (File.Exists(mainScript))
            {
                report += $"✓ {mainScript}\n";
            }
            else
            {
                report += $"✗ {mainScript} (Missing)\n";
                isValid = false;
            }

            // Check example script
            string exampleScript = "Assets/GameAlytics/Examples/GameAnalyticsUsageExample.cs";
            if (File.Exists(exampleScript))
            {
                report += $"✓ {exampleScript}\n";
            }
            else
            {
                report += $"✗ {exampleScript} (Missing)\n";
                isValid = false;
            }

            report += $"\nValidation Result: {(isValid ? "PASSED" : "FAILED")}";

            Debug.Log(report);
            EditorUtility.DisplayDialog(
                "Package Structure Validation",
                report,
                "OK"
            );
        }
    }
}