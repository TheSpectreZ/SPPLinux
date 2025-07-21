#!/bin/bash

waitress-serve --host=0.0.0.0 --port=4000 --threads=1 ServerLauncher:app
