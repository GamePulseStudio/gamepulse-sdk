using UnityEngine;
using UnityEditor;
using System.IO;

public class GamepulsePackageExporter
{
    [MenuItem("Gamepulse/Export Package")]
    public static void ExportPackage()
    {
        string packageName = "Gamepulse.unitypackage";
        string[] assetPaths = {
            "Assets/GamePulse"
        };
        
        // Get version from command line or use default
        string version = GetVersionFromCommandLine() ?? "latest";
        if (version != "latest")
        {
            packageName = $"Gamepulse-{version}.unitypackage";
        }
        
        string exportPath = Path.Combine(Application.dataPath, "..", "..", packageName);
        
        Debug.Log($"Exporting Gamepulse Unity Package to: {exportPath}");
        
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