import type { PoliticalControlKey } from './schema.js';

export type PositionScore=-2|-1|0|1|2|null;
export type HumanReviewStatus='APROBADO'|'UNMAPPED_TRAS_REVISION';
export interface PoliticalPositionCode {
  score:PositionScore;
  evidence:string[];
  rationale:string;
  confidence:'HIGH'|'MEDIUM'|'LOW'|null;
  reviewStatus?:HumanReviewStatus;
}
export type PoliticalActorCoding=Record<PoliticalControlKey,PoliticalPositionCode>;

const unmapped=(rationale:string,reviewStatus?:HumanReviewStatus):PoliticalPositionCode=>({score:null,evidence:[],rationale,confidence:null,...(reviewStatus?{reviewStatus}:{})});
const code=(score:-2|-1|0|1|2,evidence:string[],rationale:string,confidence:'HIGH'|'MEDIUM'|'LOW'='MEDIUM',reviewStatus?:HumanReviewStatus):PoliticalPositionCode=>({score,evidence,rationale,confidence,...(reviewStatus?{reviewStatus}:{})});

export const POLITICAL_CODING:Record<string,PoliticalActorCoding>={
  'preset-es-pp-23j-2023-v1':{
    taxShift:code(-1,['PP-IRPF-001','PP-PATRIMONIO-001'],'Propone deflactar la tarifa del IRPF y eliminar el impuesto temporal a grandes fortunas: ambas medidas reducen impuestos directos de hogares. Se codifica una reducción moderada; la propuesta no fija una reforma general de tipos.', 'MEDIUM'),
    progressivity:unmapped('El IRPF se deflacta, pero el programa no precisa la reforma por niveles de renta; eliminar el impuesto a grandes fortunas no permite inferir por sí solo el cambio neto del diferencial de carga representado.'),
    consumptionTax:unmapped('Las rebajas de IVA identificadas son parciales y/o temporales y no permiten inferir de forma suficientemente sólida un descenso de un paso completo en el tipo efectivo agregado sobre el consumo.'),
    corporateTax:unmapped('Se propone simplificar Sociedades para determinados colectivos empresariales, sin expresar con claridad una subida o reducción material del impuesto.'),
    transfers:unmapped('Las medidas sobre IMV y pensiones son de acceso, compatibilidad o sostenibilidad; no expresan una dirección general inequívoca del importe de transferencias monetarias.'),
    publicInvestment:code(1,['PP-VIVIENDA-002','PP-INFRA-001'],'El programa plantea movilizar suelo y promover vivienda social, además de inversiones en transporte, agua e infraestructuras. El conjunto indica una ampliación moderada de inversión pública, sin objetivos que justifiquen intensidad fuerte.', 'MEDIUM'),
    services:unmapped('Las propuestas de acceso y mejora de servicios no especifican de forma suficientemente clara una expansión o reducción de recursos corrientes.'),
    investmentFriction:unmapped('El control parte de fricción 0 y su mínimo también es 0; por tanto, la dirección de menor fricción no puede representarse con los límites vigentes. No se codifica como score 0 porque el programa sí plantea reducirla.')
  },
  'preset-es-psoe-23j-2023-v1':{
    taxShift:unmapped('Los incentivos y mínimos fiscales se dirigen a familias y vivienda; el programa no expresa una dirección general para la carga directa agregada de los hogares.'),
    progressivity:unmapped('Hay medidas familiares y de fiscalidad justa, pero no se identifica una dirección suficientemente concreta del diferencial de carga entre rentas altas y bajas.'),
    consumptionTax:unmapped('No se encuentra en el programa una propuesta estatal identificable que aumente o reduzca de forma material la fiscalidad general sobre el consumo.'),
    corporateTax:unmapped('Los incentivos empresariales no expresan una dirección general y material del impuesto sobre beneficios.'),
    transfers:code(1,['PSOE-TRANS-001','PSOE-TRANS-002','PSOE-TRANS-003','PSOE-SERV-002'],'El programa muestra una dirección clara de aumento de transferencias, pero la evidencia disponible no justifica clasificar el conjunto como un cambio fuerte de dos pasos en la escala normalizada.', 'HIGH'),
    publicInvestment:code(2,['PSOE-PUBINV-001','PSOE-PUBINV-002'],'Fija expansión del parque de vivienda pública y varios programas de construcción/adquisición de vivienda. La orientación es una ampliación estructural de capital público habitacional; no se interpreta como coste presupuestario exacto.', 'HIGH'),
    services:code(2,['PSOE-SERV-001','PSOE-SERV-002'],'Establece objetivos de gasto para sanidad, educación y servicios sociales y desarrolla ampliaciones de cobertura. La amplitud de sectores y los objetivos agregados respaldan una posición de aumento fuerte de recursos corrientes, aunque las partidas mezclen componentes.', 'MEDIUM'),
    investmentFriction:unmapped('Las medidas regulatorias sobre ahorro y vivienda no forman un conjunto estatal claro de licencias, trámites o restricciones a la inversión privada.')
  },
  'preset-es-vox-23j-2023-v1':{
    taxShift:code(-2,['VOX-IRPF-001','VOX-IRPF-002','VOX-IRPF-003','VOX-IRPF-004','VOX-IRPF-005'],'Propone dos tipos de IRPF, elevar la exención laboral y aplicar reducciones familiares, deducciones de vivienda/alquiler y exención de pensiones. El paquete amplio expresa una reducción fuerte de impuestos directos a hogares.', 'HIGH'),
    progressivity:code(-1,['VOX-IRPF-001','VOX-IRPF-002','VOX-IRPF-005'],'La sustitución de la estructura vigente por dos tipos y las reducciones familiares generalizadas comprimen la diferenciación de tipos. Se interpreta como una reducción moderada de progresividad; no se usa el tipo marginal como valor del control.', 'MEDIUM'),
    consumptionTax:code(-2,['VOX-IVA-001','VOX-VIVIENDA-001'],'Propone IVA cero para bienes esenciales y vivienda familiar, con alcance amplio sobre la cesta y la primera adquisición. La dirección del conjunto es reducir materialmente la fiscalidad del consumo.', 'MEDIUM'),
    corporateTax:code(-2,['VOX-SOC-001'],'Propone reducir progresivamente el tipo legal de Sociedades hasta el 15 %. Se codifica la dirección e intensidad del compromiso, sin convertir el tipo nominal al proxy del modelo.', 'HIGH'),
    transfers:unmapped('La reordenación de prestaciones y las prioridades de elegibilidad combinan posibles ampliaciones y restricciones; el programa no permite fijar una dirección neta común.'),
    publicInvestment:unmapped('Las referencias a sanidad e infraestructuras no precisan suficientemente un compromiso de aumento o reducción de inversión pública frente al baseline.'),
    services:unmapped('Las propuestas de gasto y reorganización no permiten distinguir una dirección clara del gasto corriente en servicios públicos.'),
    investmentFriction:unmapped('El programa usa compromisos generales de simplificación y liberalización, pero no se identifica un conjunto estatal operativo suficientemente concreto para asignar un paso.')
  },
  'preset-es-sumar-23j-2023-v1':{
    taxShift:code(1,['SUMAR-IRPF-001'],'Propone elevar marginales de IRPF en rentas altas y tipos sobre rentas del ahorro. Aunque la incidencia se concentra en esos tramos, la dirección textual es subir impuestos directos a hogares; se asigna un paso.', 'MEDIUM'),
    progressivity:code(2,['SUMAR-IRPF-001'],'Eleva tipos a partir de umbrales altos y plantea una escala superior hasta el 52 %, además de cambios sobre rentas del ahorro. Varias reformas explícitas refuerzan materialmente la carga relativa en rentas altas.', 'HIGH'),
    consumptionTax:unmapped('El programa combina rebajas fiscales en determinados consumos con otras medidas de fiscalidad indirecta/ambiental; la dirección neta sobre un único tipo efectivo agregado de consumo es ambigua.'),
    corporateTax:code(2,['SUMAR-SOC-001'],'Propone un tipo efectivo mínimo del 15 % y limitar deducciones y exenciones. El paquete expresa una subida material de la carga empresarial efectiva.', 'HIGH'),
    transfers:code(2,['SUMAR-TRANSFERS-001','SUMAR-TRANSFERS-002','SUMAR-TRANSFERS-003','SUMAR-TRANSFERS-004','SUMAR-TRANSFERS-005','SUMAR-TRANSFERS-006','SUMAR-TRANSFERS-007'],'El programa combina bono hipotecario, herencia universal, prestación infantil, mejoras de pensiones y complementos, ampliación del IMV y ayudas de emergencia. La orientación acumulada de nuevas/ampliadas transferencias es fuertemente expansiva; no se suman importes ni se afirma un coste neto.', 'HIGH'),
    publicInvestment:code(2,['SUMAR-PUBINV-001','SUMAR-PUBINV-002','SUMAR-PUBINV-003','SUMAR-PUBINV-004','SUMAR-SERV-002'],'Propone inversión de vivienda, inversión deportiva, recursos públicos PERTE, objetivo de I+D pública y creación de plazas infantiles. El conjunto cubre varios activos y ámbitos con compromisos cuantificados o programáticos, por lo que se codifica una expansión fuerte sin sumar magnitudes.', 'HIGH'),
    services:code(2,['SUMAR-SERV-001','SUMAR-SERV-002','SUMAR-SERV-003','SUMAR-SERV-004','SUMAR-SERV-005'],'Propone ampliar cuidados, escuelas infantiles, Plan Corresponsables, financiación de dependencia y protección familiar. La diversidad de servicios y expansión de recursos respalda aumento fuerte de gasto corriente; transferencias monetarias se excluyen de esta codificación.', 'HIGH'),
    investmentFriction:unmapped('La agencia industrial y la simplificación financiera no especifican un conjunto suficiente de medidas sobre licencias, trámites o restricciones a inversión privada.')
  },
  'preset-es-erc-23j-2023-v1':{
    taxShift:unmapped('Las reformas fiscales estatales identificadas no indican dirección concreta de la carga general sobre hogares; las propuestas propias son territoriales.'),
    progressivity:code(1,['ERC-FISC-002'],'La dirección hacia mayor progresividad está suficientemente apoyada por propuestas explícitas sobre rentas altas y capital, aunque la intensidad se mantiene prudentemente en un solo paso.', 'MEDIUM'),
    consumptionTax:unmapped('Las propuestas fiscales de consumo revisadas se refieren principalmente a capacidad normativa territorial y no fijan una dirección estatal.'),
    corporateTax:unmapped('Las reformas estatales de lucha contra fraude y fiscalidad empresarial no expresan una dirección general material del impuesto sobre beneficios.'),
    transfers:unmapped('Las propuestas de prestaciones y del IMV se refieren a competencias territoriales o no expresan cambio estatal de cuantías.'),
    publicInvestment:unmapped('Las inversiones identificadas corresponden a Catalunya/Països Catalans y no se extrapolan al conjunto de España.'),
    services:unmapped('Las propuestas de sanidad, educación y dependencia se refieren a provisión territorial y no fijan dirección estatal.'),
    investmentFriction:unmapped('La simplificación y ampliación de autogobierno no especifican cambios estatales operativos de licencias o regulación de inversión privada.')
  },
  'preset-es-pnv-23j-2023-v1':{
    taxShift:unmapped('Las propuestas fiscales respetan marcos forales y no identifican una dirección general estatal de la carga sobre hogares.'),
    progressivity:code(1,['PNV-FISC-001'],'El programa 23J expresa una orientación clara hacia mayor progresividad fiscal y un sistema tributario basado en progresividad, equidad y justicia social. Se asigna un paso moderado.','MEDIUM','APROBADO'),
    consumptionTax:unmapped('La fiscalidad verde referida no establece una dirección estatal material de los impuestos al consumo.'),
    corporateTax:unmapped('Las prestaciones energéticas e impuestos empresariales no establecen una reforma general estatal de Sociedades.'),
    transfers:unmapped('La defensa de pensiones y otras iniciativas redistributivas concretas no basta para establecer un aumento agregado de un paso completo en transferencias monetarias frente al baseline.','UNMAPPED_TRAS_REVISION'),
    publicInvestment:code(1,['PNV-PUBINV-001'],'El programa contiene una dirección clara de preservación y refuerzo de la capacidad de inversión pública, especialmente en transición digital, ecológica y ejecución de fondos públicos. Se asigna un paso moderado.','MEDIUM','APROBADO'),
    services:unmapped('El refuerzo de servicios se formula principalmente para Euskadi y sin un compromiso estatal agregado.'),
    investmentFriction:unmapped('Las propuestas de flexibilidad y menor burocracia se refieren a convocatorias/regulación territorial y no sostienen una codificación estatal.')
  },
  'preset-es-bng-23j-2023-v1':{
    taxShift:unmapped('La deflactación y capacidad fiscal se refieren al marco gallego; no hay una reforma estatal general identificada.'),
    progressivity:unmapped('Las medidas de progresividad fiscal identificadas pertenecen al marco gallego y no se extrapolan.'),
    consumptionTax:unmapped('Las medidas de fiscalidad ambiental y vivienda no definen una dirección estatal material de impuestos al consumo.'),
    corporateTax:unmapped('Las propuestas de fiscalidad empresarial no fijan una dirección general estatal de la carga societaria.'),
    transfers:code(1,['BNG-TRANS-003'],'Propone elevar la pensión mínima al 60 % del salario medio y actualizarla con el IPC real. Es una mejora estatal de transferencias monetarias expresamente formulada; se codifica un aumento moderado.', 'MEDIUM'),
    publicInvestment:unmapped('Las referencias a infraestructuras e inversión universitaria se orientan a Galicia y no se extrapolan al conjunto de España.'),
    services:unmapped('La ampliación de sanidad y educación se refiere a Galicia; las metas presupuestarias territoriales no se escalan.'),
    investmentFriction:unmapped('Las reformas administrativas y de regulación identificadas no forman un paquete estatal operativo para inversión privada.')
  },
  'preset-es-upn-23j-2023-v1':{
    taxShift:code(-1,['UPN-FISC-001'],'El programa del 23J expresa una dirección clara de reducción de impuestos y deflactación de la tarifa del IRPF. Bajo la rúbrica estandarizada, esto justifica un paso negativo en impuestos directos sobre hogares.','MEDIUM','APROBADO'),
    progressivity:unmapped('No hay propuesta estatal concreta que indique el cambio relativo de carga entre niveles de renta.'),
    consumptionTax:unmapped('No se identifica una reforma estatal de IVA o impuestos al consumo; las referencias fiscales son generales o territoriales.'),
    corporateTax:unmapped('Las ayudas a autónomos y empleo no concretan la dirección estatal del impuesto sobre beneficios.'),
    transfers:unmapped('La evidencia disponible no permite concluir una posición agregada suficientemente clara sobre el nivel total de transferencias monetarias respecto al baseline.','UNMAPPED_TRAS_REVISION'),
    publicInvestment:unmapped('Las medidas de energía, patrimonio y zonas rurales están referidas a Navarra y carecen de un compromiso estatal.'),
    services:unmapped('Las propuestas de sanidad y educación son territoriales y no especifican recursos estatales corrientes.'),
    investmentFriction:unmapped('La facilitación empresarial se formula de forma general y territorial, sin un conjunto operativo estatal identificable.')
  },
  'preset-es-junts-23j-2023-v1':{
    taxShift:unmapped('El programa aborda el déficit fiscal de Catalunya y medidas fiscales territoriales, pero no fija una dirección general estatal de la carga directa sobre hogares.'),
    progressivity:unmapped('No se identifica una propuesta estatal clara sobre la carga relativa entre hogares de renta alta y baja.'),
    consumptionTax:unmapped('No debe usarse material posterior al 23J para reconstruir retrospectivamente una posición electoral de 2023. Mientras no exista una fuente primaria oficial del 23J recuperable y verificable, el IVA queda sin mapear.','UNMAPPED_TRAS_REVISION'),
    corporateTax:unmapped('Las propuestas de fiscalidad empresarial no fijan un cambio estatal general y material de los impuestos sobre beneficios.'),
    transfers:unmapped('Las propuestas sociales identificadas se orientan principalmente a Catalunya o no definen una dirección estatal general de transferencias monetarias.'),
    publicInvestment:unmapped('Las reclamaciones de inversión pública y transporte se refieren al déficit de inversión en Catalunya; no se extrapolan al conjunto estatal.'),
    services:unmapped('Las propuestas de bienestar y financiación de servicios se formulan principalmente para Catalunya y no permiten codificar el gasto corriente estatal.'),
    investmentFriction:unmapped('No se identifica un conjunto estatal operativo de reformas de licencias o trámites que permita codificar este control.')
  },
  'preset-es-eh-bildu-23j-2023-v1':{
    taxShift:unmapped('Las propuestas tributarias se dirigen a grandes patrimonios, bancos y energéticas; no establecen una dirección general de impuestos directos para los hogares.'),
    progressivity:code(1,['EHBILDU-FISC-001'],'El documento plantea elevar la contribución de grandes fortunas y hacer permanentes gravámenes a banca y energía. La dirección refuerza moderadamente la carga relativa de rentas altas y capital.','MEDIUM','APROBADO'),
    consumptionTax:unmapped('No se identifica una propuesta estatal material de cambio general en la fiscalidad sobre el consumo.'),
    corporateTax:unmapped('Los gravámenes sectoriales a banca, energía y grandes distribuidoras no equivalen a una posición sobre la fiscalidad general de beneficios empresariales.'),
    transfers:code(1,['EHBILDU-IMV-001'],'El compromiso propone ampliar el acceso al IMV y elevar un 12 % sus cuantías. Es una expansión clara de una transferencia, pero no una transformación general del conjunto; un paso moderado.','HIGH','APROBADO'),
    publicInvestment:unmapped('Existen propuestas de inversión, pero parte significativa de la evidencia tiene componente territorial y no se considera suficiente para aplicar un paso estatal agregado.','UNMAPPED_TRAS_REVISION'),
    services:code(1,['EHBILDU-SERV-001'],'El programa contiene propuestas claras de refuerzo de Atención Primaria, salud mental y ampliación de servicios públicos, suficientes para codificar una dirección positiva moderada en gasto corriente en servicios públicos.','MEDIUM','APROBADO'),
    investmentFriction:unmapped('No se identifica un conjunto estatal operativo que cambie materialmente licencias, trámites o restricciones a la inversión privada.')
  },
  'preset-es-cc-23j-2023-v1':{
    taxShift:unmapped('El manifiesto propone medidas fiscales para residentes de La Palma y otros mecanismos del REF; son territoriales y no se extrapolan.'),
    progressivity:unmapped('No se identifica una propuesta estatal sobre el diferencial de carga entre niveles de renta.'),
    consumptionTax:unmapped('No se identifica una reforma estatal general de IVA o de impuestos al consumo; las ayudas fiscales corresponden a Canarias.'),
    corporateTax:unmapped('Las bonificaciones e incentivos descritos se vinculan al REF y a actividades canarias, no a una reforma estatal general de Sociedades.'),
    transfers:unmapped('El programa contiene compromisos sobre pensiones, pobreza, dependencia y ayudas, pero buena parte del contenido es específicamente territorial para Canarias y no justifica trasladar un aumento agregado estatal de transferencias al modelo.','UNMAPPED_TRAS_REVISION'),
    publicInvestment:unmapped('La inversión media, infraestructuras educativas y ferroviarias se reclaman para Canarias; no se escalan al conjunto de España.'),
    services:unmapped('Las peticiones de financiación sanitaria, educativa y de dependencia se dirigen a Canarias y no definen una expansión estatal general.'),
    investmentFriction:unmapped('No se identifica una propuesta estatal general sobre licencias o trámites aplicable al conjunto del modelo.')
  }
};
