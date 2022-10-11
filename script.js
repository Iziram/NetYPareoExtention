function getBilanTable(id_annee) {
    const divBilan = document.getElementById(id_annee);
    return divBilan.childNodes[1].childNodes[3];
}
function searchStr(str, searchString) {
    return str.indexOf(searchString) != -1
}
/**
 * 
 * @param {HTMLTableElement} table 
 */
async function tableToCSV(table) {
    const trList = Array.from(table.getElementsByTagName('tr'));
    let csv = "Modules et séquences;apprenant;Entreprise;Formateur;Observation Apprenant;Observation Entreprise;Observation Formateur\n";
    for (i in trList) {
        const el = trList[i];
        if (searchStr(el.className, 'hidden')) { continue; }
        if (searchStr(el.className, "row-module")) {
            csv += `${el.childNodes[1].childNodes[1].title};;;;;;\n`;
            continue;
        }
        if (searchStr(el.className, "row-sequence ")) {
            csv += `    ${el.childNodes[1].childNodes[1].title};;;;;;\n`;
            continue;
        }
        if (searchStr(el.className, "row-sequence-elt")) {
            if (searchStr(el.className, "is-evaluable")) {

                const evals = Array.from(el.getElementsByClassName('text-center'));
                const evalsCodes = evals.map((ev) => {
                    let code = "";
                    if (ev.childElementCount > 0) {
                        const fullCode = ev.lastChild.getAttribute("data-tooltip-content");
                        code = fullCode.replace('</br>', ' - ');
                    }
                    return code;
                })

                const observations = await getObservations(el);
                if(observations){
                    csv += `            ${el.childNodes[1].childNodes[1].title};${evalsCodes[0]};${evalsCodes[1]};${evalsCodes[2]};${observations[0]};${observations[1]};${observations[2]}\n`;

                }else{
                csv += `            ${el.childNodes[1].childNodes[1].title};${evalsCodes[0]};${evalsCodes[1]};${evalsCodes[2]};;;\n`;

                }
                continue;
            }
            csv += `        ${el.childNodes[1].childNodes[1].title};;;;;;\n`
            continue;
        }
    }
    return csv
}

function downloadCSV(csv, csv_name) {
    const link = document.createElement('a');
    link.download = csv_name;
    const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8' });
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

async function getObservations(el){
    //On récupère un table cell avec un span et un button
    let observations = null;
    //On vérifie que le span à du texte
    if(el.getElementsByTagName('span')[1].textContent !== ""){
        //On active le button, puis on récupère dans le modal nouvellement généré les observations.
        
        
        el.getElementsByTagName('button')[0].click(); //génère le modal
        
        observations = await new Promise((resolve)=>{
            setTimeout(function() {
                //on récup le dernier modal en date
                const modals = document.getElementsByClassName('remote-layout-container');
                const modal = modals[modals.length - 1];
                // delete(modals);
                
                //On récupère les observations
        
                const o = Array.from(modal.getElementsByClassName('section-content')).map((cnt) => {
                    return cnt.lastChild.textContent.replace('\n','').trim();
                });
        
                //on kill le modal
                modal.getElementsByClassName('btn')[0].click();
                resolve(o);
            }, 500);
        });
        for(let i = observations.length; i< 3; i++){
            observations.push('');
        }
        return observations
    }
    return observations
}

function doAll(id_annee, id_periode = -1) {
    if (id_periode != -1) {
        const str_periode = `bilan-activite-periode-${id_periode}-${id_annee}`;
        tableToCSV(getBilanTable(str_periode)).then((csv)=>{downloadCSV(csv, str_periode + ".csv")})
        
    } else {
        const str_annee = `bilan-activite-annee-${id_annee}`;
        tableToCSV(getBilanTable(str_annee)).then((csv)=>{downloadCSV(csv, str_annee + ".csv")})
        
    }
}

if (location.href.includes('https://portailfca.univ-rennes1.fr/netypareo/index.php/')) {
    const type = prompt('Type : ');
    if (type !== "annee") {
        doAll(location.href.substring(location.href.indexOf('/activites/') + 11, location.href.indexOf('/activites/') + 18),
            location.href.substring(location.href.indexOf('/activites/') + 19, location.href.indexOf('/activites/') + 18 + 4)
        );

    } else {
        doAll(location.href.substring(location.href.indexOf('/activites/') + 11, location.href.indexOf('/activites/') + 18));
    }
}
