# Celestialy's object database
This is the official repo for the celestialy website database, it is a work in progress and should be used with caution.

# Files
The files in this repo are organized as follows:

- `out/` : Contains the JSON data for the objects (in the format used by the database)
  - `data.json`: The JSON data for the objects (containing ic ngc and messier catalogs)
- `open-ngc/`: Contains the Open NGC data from [Open NGC repo](https://github.com/mattiaverga/OpenNGC)
- `convert.js`: A script that converts the Open NGC data to the format used by the database (and repairs the errors in it). Please don't use it as i don't know if the script will work on your computer.

## Special thanks
- [@sotiriad](https://github.com/sotiriad) for the Open NGC repo (under CC-BY-SA-4.0 license)
### Data sources
- [Open NGC](https://github.com/mattiaverga/OpenNGC)
   - NASA/IPAC Extragalactic Database
   http://ned.ipac.caltech.edu/
   This research has made use of the NASA/IPAC Extragalactic Database (NED)
   which is operated by the Jet Propulsion Laboratory,
   California Institute of Technology, under contract with the
   National Aeronautics and Space Administration.
  - HyperLEDA database
   http://leda.univ-lyon1.fr
   We acknowledge the usage of the HyperLeda database (http://leda.univ-lyon1.fr)
  - SIMBAD Astronomical Database
   http://simbad.u-strasbg.fr/simbad/
   This research has made use of the SIMBAD database, operated at CDS, Strasbourg, France
  - HEASARC High Energy Astrophysics Science Archive Research Center
   http://heasarc.gsfc.nasa.gov/
   We used several databases from HEASARC such as messier, mwsc, lbn, plnebulae, lmcextobj and smcclustrs.
  - Harold Corwin's NGC/IC Positions and Notes
   http://haroldcorwin.net/ngcic/index.html

_Please note that some common names of objects comes from wikipedia_

# Licence
This project is licensed under the [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/) license
Please see the [LICENSE](https://github.com/CelestialyXYZ/objects-db/blob/master/LICENSE) file for more information