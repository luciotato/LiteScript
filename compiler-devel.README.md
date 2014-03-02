Developing a new version of LiteScript 
======================================

The LiteScript compiler is written in LiteScript. 

As a result, a previous version of the compiler 
is used to to develop and compile a newer -unstable- version. 

Check the /devel dir.

Once the new liteCompiler version passes all tests and can compile itself,
it's ready for release.

Environment
-----------

It's very useful to have syntax coloring to try a new language. This is what I use:

- OS: Linux, Debian, with KDE / or the linux distro that pleases you
- node.js >= 0.10
- [Sublime Text 2](http://www.sublimetext.com/2) Higly recommended 
- LiteScript tmLanguage for Sublime Text. Check: (/extras/sublime)
- A custom theme for Sublime Text "Lite Dark" based on "Soda Dark". Check: (/extras/sublime)
- A very simple Sublime "build system" (Ctrl-B)

	{
		"working_dir": "$project_path",
		"cmd": ["sh","build.sh"],
		"file_regex": "([\\w./_-]+?):([0-9]+):([0-9]+)(.*)",
	}

Once you have all that, with Sublime, "open folder" /devel/sourcev-0.6.0, the open "Compiler.lite.md".

- You can no compile (current dir) with Ctrl-B 
and then use F4 to check each error (Sublime jumps automatically to source pos)

This environment It's higly recommendable to be productive with the language.

If you hav a windows box, it's time to start using Linux. Node.js works on windows, but some other ver useful tools
do not (like node-inspector). Go now and download "Virtual Box". After installing "Virtual Box" goto http://www.debian.org/distrib/netinst and continue from there until you've gto the above configuration.

You can also clone the otrhe repositories: litescript_reception_demo and LiteScript_online_playground, to see a web proyect using LiteScript.

