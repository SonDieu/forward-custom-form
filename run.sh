#!/bin/bash

DEPLOY_DIR="deploy"

if [[ $@ ]];
    then

    if [[ "$@" == "cleanup" ]]
        then
        rm -rf ./customform
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

    if [[ $# == 2 && $1 == "compile" ]]
        then
        rm -rf ./customform/$DEPLOY_DIR && mkdir ./customform/$DEPLOY_DIR 
        (cd customform && ./run.sh compile-deploy $2)
        if [ ! -d "$DEPLOY_DIR" ]; then
            mkdir $DEPLOY_DIR
        fi
        mv ./customform/$DEPLOY_DIR/$2.tar.gz ./$DEPLOY_DIR/$2.tar.gz
        exit 0
    fi

    if [[ "$@" == "dev-server" ]]
        then
        (cd customform && ./run.sh dev-server)
        exit 0
    fi

    if [[ $# == 2 && "$1" == "backup" ]] 
        then
        ./run.sh cleanup
        ./run.sh download-form
        ./run.sh setup-form
        ./run.sh bootstrap
        ./run.sh compile $2
        exit 0
    fi
fi
