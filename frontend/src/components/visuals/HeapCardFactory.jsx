import React from 'react';
import ArrayVisual from './ArrayVisual';
import LinkedListVisual from './LinkedListVisual';
import DoublyLinkedListVisual from './DoublyLinkedListVisual';
import TreeVisual from './TreeVisual';
import StackVisual from './StackVisual';
import QueueVisual from './QueueVisual';
import CollectionVisual from './CollectionVisual';
import MapVisual from './MapVisual';
import StringBuilderVisual from './StringBuilderVisual';
import StringVisual from './StringVisual';
import PrimitiveWrapperVisual from './PrimitiveWrapperVisual';
import GenericObjectVisual from './GenericObjectVisual';

export default function HeapCardFactory({ heapId, objDto, isNested = false, depth = 0 }) {
  const visualType = objDto?.visualType || 'object';
  const tooltipText = `Class: ${objDto?.type || 'Object'}\nVisual Type: ${visualType}`;

  const renderVisualComponent = () => {
    switch (visualType) {
      case 'array':
        return <ArrayVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'linked_list':
        return <LinkedListVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'doubly_linked_list':
        return <DoublyLinkedListVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'tree_node':
        return <TreeVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'stack':
        return <StackVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'queue':
      case 'deque':
        return <QueueVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'list':
      case 'set':
        return <CollectionVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'map':
        return <MapVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'string_builder':
        return <StringBuilderVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'string':
        return <StringVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'primitive_wrapper':
        return <PrimitiveWrapperVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
      case 'object':
      default:
        return <GenericObjectVisual heapId={heapId} objDto={objDto} isNested={isNested} depth={depth} />;
    }
  };

  return (
    <div title={tooltipText} style={{ height: '100%' }}>
      {renderVisualComponent()}
    </div>
  );
}
