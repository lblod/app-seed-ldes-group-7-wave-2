title: LDES to Virtuoso
note:
Re-useable pipeline to load any LDES data into Virtuoso

Mock LDES Server <- LDIO Workbench: get first page
LDIO Workbench -> LDIO Workbench: split into members
LDIO Workbench -> Linked Data Sender: store each member
Linked Data Sender -> Virtuoso: insert member
