#!/bin/bash

if [[ $@ ]];
    then
    if [[ "$@" == "setup" ]]
        then
        rm -rf ./customform && rm -rf ./deploy && git clone  --single-branch git@github.com:Skedulo/phoenix_customforms.git ./customform && rm -rf ./customform/public
        unzip  -P skedcoins ./download/viewSources.zip -d ./customform 
        mkdir ./customform/deploy
        exit 0
    fi

    if [[ "$@" == "bootstrap" ]]
        then
        ./customform/run.sh bootstrap
        exit 0
    fi

    if [[ $1 == "compile"  ]]
        then
        ./customform/run.sh compile-deploy deploy_pkg
        mkdir deploy && mv ./customform/deploy/deploy_pkg.tar.gz ./deploy
        exit 0
    fi
fi
