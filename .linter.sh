#!/bin/bash
cd /home/kavia/workspace/code-generation/surprisebite-112534-ba29d185/surprisebite_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

