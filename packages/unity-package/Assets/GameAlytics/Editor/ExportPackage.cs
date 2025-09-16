using UnityEngine;
using UnityEditor;
using System.IO;

public class GameAlyticsPackageExporter
{
    [MenuItem("GameAlytics/Export Package")]
    public static void ExportPackage()
    {
        string packageName = "GameAlytics.unitypackage";
        string[] assetPaths = {
            "Assets/GameAlytics"
        };
        
        // Get version from command line or use default
        string version = GetVersionFromCommandLine() ?? "latest";
        if (version != "latest")
        {
            packageName = $"GameAlytics-{version}.unitypackage";
        }
        
        string exportPath = Path.Combine(Application.dataPath, "..", "..", packageName);
        
        Debug.Log($"Exporting GameAlytics Unity Package to: {exportPath}");
        
        AssetDatabase.ExportPackage(
            assetPaths,
            exportPath,
            ExportPackageOptions.Recurse | ExportPackageOptions.IncludeDependencies
        );
        
        Debug.Log($"Package exported successfully: {packageName}");
    }
    
    private static string GetVersionFromCommandLine()
    {
        string[] args = System.Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++)
        {
            if (args[i] == "-version")
            {
                return args[i + 1];
            }
        }
        return null;
    }
}