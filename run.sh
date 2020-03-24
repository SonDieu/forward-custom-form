#!/bin/bash

if [[ $@ ]];
    then
    if [[ "$@" == "cleanup" ]]
        then
        rm -rf ./customform && rm -rf ./deploy
        exit 0
    fi

    if [[ "$@" == "download-form" ]]
        then
        node index.js
        exit 0
    fi

    if [[ "$@" == "setup-form" ]]
        then
        git clone  --single-branch git@github.com:Skedulo/phoenix_customforms.git ./customform && rm -rf ./customform/public
        unzip  -P skedcoins ./download/viewSources.zip -d ./customform 
        exit 0
    fi

    if [[ "$@" == "bootstrap" ]]
        then
        (cd customform && ./run.sh bootstrap)
        exit 0
    fi

    if [[ $1 == "compile" ]]
        then
        rm -rf ./customform/deploy && mkdir ./customform/deploy 
        (cd customform && ./run.sh compile-deploy deploy_pkg)
        mv ./customform/deploy/deploy_pkg.tar.gz ./deploy
        exit 0
    fi

    if [[ "$@" == "dev-server" ]]
        then
        (cd customform && ./run.sh dev-server)
        exit 0
    fi

    else 
        ./run.sh cleanup
        ./run.sh download-form
        ./run.sh setup-form
        ./run.sh bootstrap
        ./run.sh compile
        exit 0
fi
