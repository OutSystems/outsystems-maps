# Gulp

<p align="center">
  <a href="https://gulpjs.com">
    <img height="113" width="50" src="https://raw.githubusercontent.com/gulpjs/artwork/master/gulp-2x.png">
  </a>
  <p align="center">Our streaming build system</p>
</p>


## This folder contains:

<ul>
    <li>
        Gulp tasks:
            <ul>
                <li>TypeScript Transpile</li>
            </ul>
    </li>
</ul>

## Project Structure

Bellow there is some comments about the application structure.

    .
    |
    ├── gulpfile.js                                 # gulp orchestrator
    ├── ...
    ├── gulp                                        # Contains gulp specific tasks and templates
    |   └── Tasks
    |       ├── TsTranspile.js                      # TypeScript transpile task definition
    |       └── UpdateVersion.js                    # Task used to update the repository task dynamically
    |    
    ├── ...
