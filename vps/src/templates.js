// Practical acquisition checklist. Prompts are not confirmed findings or a certification.
export const areas = [
 {id:'facilities',name:'Site & facilities',icon:'building',description:'Physical access, power, environment and site documentation.',checks:[
 ['Server room access','Inspect locks, badge permissions and visitor records.','Uncontrolled access to IT equipment','High','Restrict access to approved staff and retain visitor and access records.'],
 ['UPS and power resilience','Record UPS capacity, battery age, load and the latest runtime test.','Unverified or insufficient backup power','High','Size and test UPS protection against the required shutdown and recovery time.'],
 ['Cooling and environment','Review temperature, humidity, ventilation and environmental alerts.','IT equipment lacks environmental monitoring','Medium','Monitor temperature and humidity and assign an owner to alerts.'],
 ['Fire and water protection','Inspect fire detection, water exposure and local safety maintenance records.','IT room exposed to fire or water damage','High','Agree appropriate protection and inspection actions with facilities and safety teams.'],
 ['Rack and cabling condition','Inspect rack security, cable labels, patch panels and spare capacity.','Unlabelled or unsafe rack cabling','Medium','Label and document racks and cabling; remediate physical installation issues.'],
 ['Floor plans and network rooms','Collect floor plans and identify MDF, IDFs and cable routes.','Site IT layout is not documented','Medium','Maintain current floor plans showing communications rooms and routes.'],
 ['Physical asset inventory','Reconcile sampled devices, serial numbers, owners and locations.','Physical IT inventory is incomplete','Medium','Create a reconciled asset register with ownership and location.'],
 ['Site dependency contacts','Record facilities, landlord, carriers and emergency access contacts.','Critical site contacts are not documented','Medium','Maintain a tested contact and escalation list for site dependencies.']
 ]},
 {id:'network',name:'Network & connectivity',icon:'network',description:'Connectivity, segmentation, wireless and network resilience.',checks:[
 ['Network diagrams and IP plan','Collect logical diagrams, VLANs, IP ranges, DNS and DHCP configuration.','Network topology and addressing are undocumented','Medium','Produce current diagrams and an IP address plan before integration.'],
 ['Internet and WAN resilience','Record carriers, bandwidth, contract dates, diverse paths and failover tests.','Single point of failure in WAN connectivity','High','Establish suitable redundant connectivity and test failover.'],
 ['IT, OT and guest segmentation','Review trust boundaries, firewall rules and authorised traffic flows.','Insufficient network segmentation','High','Separate IT, OT and guest networks and allow only required traffic.'],
 ['Firewall rule hygiene','Review obsolete rules, broad permissions, rule owners and change records.','Overly permissive firewall rules','High','Remove unused rules and document approved least-privilege flows.'],
 ['Wireless coverage and access','Assess office and production coverage, encryption and guest isolation.','Wireless access or coverage is inadequate','Medium','Remediate coverage gaps and enforce appropriate authenticated wireless access.'],
 ['Network device lifecycle','Check switch, router and access point support dates and firmware.','Unsupported or outdated network devices','High','Plan supported replacements and controlled firmware updates.'],
 ['Configuration backup and monitoring','Inspect configuration backups, alert routing and recovery procedures.','Network configuration recovery is unverified','High','Back up configurations and test restoring a representative device.'],
 ['Remote access and vendor VPN','Review named users, MFA, time restrictions and remote access logging.','Uncontrolled remote access to the site','High','Use named accounts, MFA, least privilege and monitored vendor access.']
 ]},
 {id:'servers',name:'Servers & cloud',icon:'server',description:'Compute platforms, identity, data protection and recovery.',checks:[
 ['Server and service inventory','List physical servers, VMs, cloud workloads, owners and dependencies.','Server and service inventory is incomplete','Medium','Maintain an owned inventory with business criticality and dependencies.'],
 ['Operating system support','Check OS, hypervisor and database versions against support agreements.','Unsupported server platforms','High','Replace or upgrade unsupported platforms using an approved transition plan.'],
 ['Backup scope and isolation','Review backup coverage, retention, encryption and isolated copies.','Backups do not adequately protect critical systems','Critical','Cover critical workloads and protect recovery copies from production compromise.'],
 ['Restore testing and recovery objectives','Request restore evidence and agreed RPO and RTO for critical services.','Recovery capability has not been demonstrated','High','Set business recovery objectives and perform documented restore tests.'],
 ['Capacity and hardware health','Review disk, memory, CPU trends, warranty and hardware alerts.','Insufficient capacity or failing server hardware','Medium','Address health alerts and plan capacity based on workload trends.'],
 ['Directory and identity dependencies','Map domains, tenants, trusts, synchronisation and service accounts.','Identity dependencies are undocumented','High','Document and validate identity dependencies before migration.'],
 ['Cloud ownership and billing','Confirm tenant ownership, administrator recovery, subscriptions and billing.','Cloud services lack clear ownership','High','Transfer administrative and commercial ownership and document recovery access.'],
 ['Privileged access and configuration','Sample admin rights, service account privileges and hardening records.','Excessive privilege or weak server configuration','High','Reduce privileges and apply a reviewed hardening baseline.']
 ]},
 {id:'security',name:'Cybersecurity',icon:'shield',description:'Identity controls, exposure, detection and incident readiness.',checks:[
 ['MFA coverage','Verify MFA for email, remote access and privileged accounts.','MFA is missing on critical access paths','Critical','Prioritise MFA for privileged, external and email access.'],
 ['Endpoint protection coverage','Reconcile active endpoints against managed protection and health status.','Endpoint protection coverage is incomplete','High','Enrol supported endpoints and investigate inactive or unhealthy agents.'],
 ['Vulnerability and patch management','Review authorised scan results, patch exceptions and remediation ownership.','High-risk vulnerabilities are not managed','High','Prioritise remediation by exposure and impact with tracked exceptions.'],
 ['Account lifecycle and least privilege','Sample joiner, mover, leaver records, dormant users and admin accounts.','User access is not regularly reviewed','High','Remove stale access and implement owned access reviews.'],
 ['Security logging and alert response','Check log sources, retention, time synchronisation and response ownership.','Security events are not centrally monitored','High','Collect relevant security logs and define actionable alert handling.'],
 ['Incident response readiness','Request the incident plan, escalation contacts and exercise records.','Incident response responsibilities are unclear','High','Define an incident playbook and test escalation and recovery decisions.'],
 ['Sensitive data and encryption','Identify sensitive stores, access controls, endpoint encryption and key custody.','Sensitive information lacks appropriate protection','High','Classify sensitive information and apply suitable access and encryption controls.'],
 ['Email and staff awareness','Review mail protection, reporting channels and awareness records.','Phishing resilience and reporting are weak','Medium','Improve mail controls, staff training and incident reporting.']
 ]},
 {id:'workplace',name:'Workplace & applications',icon:'monitor',description:'User devices, business software, licences and collaboration.',checks:[
 ['Endpoint inventory and ownership','List desktops, laptops, shared terminals and assigned users.','Workplace device inventory is incomplete','Medium','Reconcile devices and assign ownership and lifecycle status.'],
 ['Device management and local admin','Check central enrolment, baseline settings and local administrator rights.','Devices are unmanaged or overprivileged','High','Enrol devices and remove unnecessary local administrator access.'],
 ['Application and licence register','Record applications, licence counts, renewals and acquisition transfer terms.','Software licensing and ownership are unclear','Medium','Reconcile installations with entitlements and confirm transfer conditions.'],
 ['Business-critical application dependencies','Map ERP, MES, finance, engineering and local integrations.','Critical application dependencies are unknown','High','Document owners, data flows and dependencies before changing services.'],
 ['Email and collaboration migration','Review domains, mailboxes, shared storage and tenant dependencies.','Collaboration migration scope is undefined','Medium','Inventory collaboration services and agree migration and coexistence plans.'],
 ['Endpoint lifecycle and patching','Sample OS support, hardware age and deployment or patch success.','Unsupported or unpatched workplace devices','High','Plan device renewal and resolve patch failures.'],
 ['Printing and shared devices','Review printers, scanners, shared logins and production peripherals.','Shared devices have weak access controls','Medium','Document peripherals and secure administrative and user access.'],
 ['User data and recovery','Check user file locations, backup coverage and self-service recovery.','User data is stored without recovery protection','Medium','Move business data to managed storage and verify recovery.']
 ]},
 {id:'ot',name:'OT & production',icon:'factory',description:'Industrial assets and dependencies, assessed with plant owners.',checks:[
 ['Industrial asset inventory','Collect approved PLC, HMI, SCADA, MES and engineering workstation inventories.','Industrial assets are not fully inventoried','High','Build an OT inventory with plant owners using safe collection methods.'],
 ['IT and OT trust boundaries','Review approved architecture and permitted industrial traffic.','Production networks lack controlled boundaries','Critical','Agree segmented OT zones and controlled conduits with operations.'],
 ['Vendor remote maintenance','Check approval, identity, logging and isolation of supplier connections.','Vendor maintenance access is uncontrolled','High','Require approved, time-bounded and monitored maintenance sessions.'],
 ['Controller and recipe backups','Request controller programs, recipes, configuration backups and restore evidence.','Production configurations are not recoverable','Critical','Secure current configuration backups and validate recovery with plant owners.'],
 ['Legacy platforms and compensating controls','Identify unsupported industrial systems and vendor maintenance constraints.','Legacy OT risks lack compensating controls','High','Document constraints and apply approved isolation and access controls.'],
 ['Production dependency and downtime map','Map dependencies on IT, identity, DNS, licensing and external services.','Production failure dependencies are unknown','High','Document downtime impacts and validate recovery sequencing.'],
 ['OT change and maintenance governance','Review maintenance windows, vendor approval, rollback and safety coordination.','OT changes lack controlled approval and rollback','High','Coordinate changes with plant safety and operations and define rollback steps.'],
 ['Removable media and engineering devices','Inspect approved USB transfer and engineering laptop access practices.','Uncontrolled devices or media enter production','High','Define approved media transfer and engineering device controls.']
 ]},
 {id:'operations',name:'IT operations',icon:'clipboard',description:'People, suppliers, documentation and service continuity.',checks:[
 ['Support model and responsibilities','Record internal staff, providers, support hours and escalation paths.','IT support ownership is unclear','Medium','Assign service responsibilities and publish escalation contacts.'],
 ['Supplier contracts and transfer','Review renewals, SLAs, termination dates and acquisition transfer clauses.','Supplier dependencies or contract obligations are unknown','High','Create a contract register and resolve transfer and renewal risks.'],
 ['Service documentation and credentials','Review runbooks, vault use, recovery access and documentation ownership.','Critical operational knowledge is not controlled','High','Maintain current runbooks and use controlled credential storage.'],
 ['Incident and service request records','Review recurring incidents, backlog, priorities and resolution ownership.','Recurring IT incidents lack tracked resolution','Medium','Record incidents consistently and prioritise recurring root causes.'],
 ['Change control','Sample change approvals, testing, impact assessment and rollback plans.','IT changes are not consistently controlled','Medium','Introduce proportionate change review, testing and rollback records.'],
 ['Business continuity and disaster recovery','Review business plans, IT recovery dependencies and exercise results.','Business continuity plans are incomplete or untested','High','Align IT recovery with business priorities and exercise the plan.'],
 ['Budget and cost baseline','Collect recurring costs, maintenance, licences and planned investment.','IT operating costs and liabilities are unclear','Medium','Establish a validated operating cost and investment baseline.'],
 ['Data retention and disposal','Review retention schedules, disposal records and asset sanitisation.','Data retention and disposal are unmanaged','Medium','Agree retention requirements and record secure disposal of data and assets.']
 ]},
 {id:'integration',name:'Integration roadmap',icon:'layers',description:'Day-one readiness, sequencing, ownership and investment.',checks:[
 ['Day-one access and ownership','Confirm who controls critical tenants, domains, accounts and support contracts.','Day-one operational control is incomplete','Critical','Resolve ownership and recovery access before critical handover dates.'],
 ['Immediate containment priorities','Review exposed services and urgent risks with business and security owners.','Urgent acquisition risks lack an action owner','High','Assign and track immediate containment actions by business impact.'],
 ['Transition service agreements','List seller-provided services, exit dates, dependencies and costs.','Seller service exit dependencies are not planned','High','Map transition services and agree a tested exit schedule.'],
 ['Target architecture gaps','Compare the site with agreed group identity, network and security standards.','Target architecture gaps are not assessed','Medium','Record gaps and agree practical target-state decisions.'],
 ['Migration sequence and rollback','Review dependencies, acceptance criteria, downtime and fallback plans.','Migration activities lack sequencing or rollback','High','Sequence migrations around dependencies and validate rollback plans.'],
 ['Investment and resource estimate','Estimate remediation costs, effort, skills and implementation windows.','Integration costs or resource needs are unquantified','Medium','Prepare an owned cost and resource estimate for prioritised actions.'],
 ['30, 60 and 90 day action plan','Check milestones, owners, dates and evidence of completion.','Integration actions lack milestones and ownership','Medium','Agree a phased action plan with accountable owners and completion criteria.'],
 ['Risk acceptance and handover','Confirm residual risk owners, approval, documentation and BAU acceptance.','Residual risks and service handover are unowned','High','Record risk acceptance and complete an operational handover review.']
 ]}
].map(area=>({...area,checks:area.checks.map(([title,prompt,finding,severity,recommendation],i)=>({id:`${area.id}-${i+1}`,title,prompt,finding,severity,recommendation}))}));
export const templates = areas.flatMap(a=>a.checks.map(c=>({...c,area:a.id})));
