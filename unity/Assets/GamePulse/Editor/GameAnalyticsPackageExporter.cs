using UnityEngine;
using UnityEditor;
using System.IO;

namespace Gamepulse.Editor
{
    /// <summary>
    /// Unity Editor script to export Gamepulse package
    /// </summary>
    public class GamepulsePackageExporter : EditorWindow
    {
        private const string PACKAGE_NAME = "Gamepulse.unitypackage";
        private const string PACKAGE_ROOT = "Assets/GamePulse";
        
        [MenuItem("Gamepulse/Export Package", priority = 1)]
        public static void ExportPackage()
        {
            string exportPath = EditorUtility.SaveFilePanel(
                "Export Gamepulse Package",
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
                
                Debug.Log($"Gamepulse package exported to: {exportPath}");
                EditorUtility.DisplayDialog(
                    "Export Complete",
                    $"Gamepulse package has been exported to:\n{exportPath}",
                    "OK"
                );
            }
        }

        [MenuItem("Gamepulse/About", priority = 100)]
        public static void ShowAbout()
        {
            EditorUtility.DisplayDialog(
                "Gamepulse Unity SDK",
Gamepulse Unity SDK v2.0.26
                "A comprehensive analytics SDK for Unity games.\n\n" +
                "Features:\n" +
                "• Cross-platform support\n" +
                "• Fluent API design\n" +
                "• Event batching and queuing\n" +
                "• Real-time analytics\n" +
                "• Comprehensive event categories\n\n" +
                "For support: support@gamepulse.com",
                "OK"
            );
        }

        private static string[] GetAssetPaths()
        {
            if (!Directory.Exists(PACKAGE_ROOT))
            {
                Debug.LogError($"Gamepulse package directory not found: {PACKAGE_ROOT}");
                return new string[0];
            }

            return new string[] { PACKAGE_ROOT };
        }

        /// <summary>
        /// Validate Gamepulse package structure
        /// </summary>
        [MenuItem("Gamepulse/Validate Package Structure", priority = 50)]
        public static void ValidatePackageStructure()
        {
            bool isValid = true;
            string report = "Gamepulse Package Structure Validation:\n\n";

            // Check main directories
            string[] requiredDirectories = {
                "Assets/GamePulse/Scripts",
                "Assets/GamePulse/Examples",
                "Assets/GamePulse/Editor",
                "Assets/GamePulse/Documentation"
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
            string mainScript = "Assets/GamePulse/Scripts/GamePulse.cs";
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
            string exampleScript = "Assets/GamePulse/Examples/GameAnalyticsUsageExample.cs";
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