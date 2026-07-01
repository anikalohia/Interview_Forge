#!/bin/bash
gunicorn run:app --bind 0.0.0.0:${PORT:-4000} --workers 2 --timeout 120