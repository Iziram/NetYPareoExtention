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
function tableToCSV(table) {
    const trList = Array.from(table.getElementsByTagName('tr'));
    let csv = "Modules et séquences;apprenant;Entreprise;Formateur\n";
    for (i in trList) {
        const el = trList[i];
        if (searchStr(el.className, 'hidden')) { continue; }
        if (searchStr(el.className, "row-module")) {
            csv += `${el.childNodes[1].childNodes[1].title};;;\n`;
            continue;
        }
        if (searchStr(el.className, "row-sequence ")) {
            csv += `    ${el.childNodes[1].childNodes[1].title};;;\n`;
            continue;
        }
        if (searchStr(el.className, "row-sequence-elt")) {
            if (searchStr(el.className, "is-evaluable")) {

                const evals = Array.from(el.getElementsByClassName('text-center'));
                const evalsCodes = evals.map((ev) => {
                    let code = "";
                    if (ev.childElementCount > 0) {
                        const fullCode = ev.lastChild.getAttribute("data-tooltip-content");
                        code = fullCode.substr(0, fullCode.indexOf('</br>'))
                    }
                    return code;
                })
                csv += `            ${el.childNodes[1].childNodes[1].title};${evalsCodes[0]};${evalsCodes[1]};${evalsCodes[2]}\n`;
                continue;
            }
            csv += `        ${el.childNodes[1].childNodes[1].title};;;\n`
            continue;
        }
    }
    return csv
}

function downloadCSV(csv, csv_name) {
    const link = document.createElement('a');
    link.download = csv_name;
    const blob = new Blob([csv], { type: 'text/plain' });
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

function doAll(id_annee, id_periode = -1) {
    if (id_periode != -1) {
        const str_periode = `bilan-activite-periode-${id_periode}-${id_annee}`;
        console.log(str_periode);
        downloadCSV(tableToCSV(getBilanTable(str_periode)), str_periode + ".csv")
    } else {
        const str_annee = `bilan-activite-annee-${id_annee}`;
        downloadCSV(tableToCSV(getBilanTable(str_annee)), str_annee + ".csv")
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
