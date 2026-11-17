#!/usr/bin/env bash
# SFX de secours synthétisés localement (100 % originaux, libres de droits).
# N'écrase jamais un fichier existant : dépose tes propres SFX dans public/sfx/.
set -euo pipefail
cd "$(dirname "$0")/../public/sfx"
gen() { [ -f "$1" ] && { echo "= $1 (existant, conservé)"; return; }
  ffmpeg -y -loglevel error -f lavfi -i "$2" ${3:-} -c:a libmp3lame -q:a 3 "$1" && echo "+ $1"; }
gen whoosh.mp3 "anoisesrc=color=pink:d=0.55:a=0.9" \
  "-af bandpass=f=900:width_type=o:w=3,afade=t=in:d=0.32:curve=exp,afade=t=out:st=0.32:d=0.23,volume=2.2"
gen impact.mp3 "aevalsrc=0.9*sin(2*PI*(45+90*exp(-t*18))*t)*exp(-t*5)+0.35*(random(0)*2-1)*exp(-t*35):d=0.7:s=44100"
gen chaching.mp3 "aevalsrc=0.35*(random(0)*2-1)*exp(-t*50)+gt(t\,0.09)*0.3*(sin(2*PI*2093*t)+0.7*sin(2*PI*3136*t)+0.5*sin(2*PI*4186*t))*exp(-(t-0.09)*7):d=0.9:s=44100"
gen glitch.mp3 "aevalsrc=0.35*sgn(sin(2*PI*(90+400*mod(floor(t*30)\,3))*t))*mod(floor(t*45)\,2)*exp(-t*3)+0.15*(random(0)*2-1)*mod(floor(t*60)\,2):d=0.35:s=44100"
