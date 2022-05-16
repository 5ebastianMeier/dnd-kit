* useSortablePlaceholder registriert die Placeholder ID für den Container im SortableContext
* dadurch kann der SortableContext darauf verzichten, dass die placeholderID zusätzlich in die items gegeben wird



<SortableContext>
{items.map(
    useSortable
)}
<Placeholder>
useSortablePlaceholder
</Placeholder>

</SortableContext>


(btw das verhalten könnte später auch recht leicht via boolean prop in useSortable integriert werden)
Abfolge für Placeholder:
* Boolean-Prop an SortableContext sorgt dafür, dass items eine zusätzliche placeholderId enthält
* Placeholder wird gerendert und führt useSortablePlaceholder aus
    * wenn placeholder nicht aktiv -> null
    * wenn placeholder aktiv -> placeholder als sortable rendern