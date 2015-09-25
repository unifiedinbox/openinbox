#!/usr/bin/env bash
echo "Installing Dependencies..."
npm install
bower install
grunt build
echo "Done"
