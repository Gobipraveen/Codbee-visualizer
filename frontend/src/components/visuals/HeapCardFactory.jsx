import React from 'react';
import ArrayVisual from './ArrayVisual';
import LinkedListVisual from './LinkedListVisual';
import TreeVisual from './TreeVisual';
import StackVisual from './StackVisual';
import QueueVisual from './QueueVisual';
import CollectionVisual from './CollectionVisual';
import MapVisual from './MapVisual';
import StringBuilderVisual from './StringBuilderVisual';
import StringVisual from './StringVisual';
import PrimitiveWrapperVisual from './PrimitiveWrapperVisual';
import GenericObjectVisual from './GenericObjectVisual';

export default function HeapCardFactory({ heapId, objDto }) {
  const visualType = objDto?.visualType || 'object';

  switch (visualType) {
    case 'array':
      return <ArrayVisual heapId={heapId} objDto={objDto} />;
    case 'linked_list':
      return <LinkedListVisual heapId={heapId} objDto={objDto} />;
    case 'tree_node':
      return <TreeVisual heapId={heapId} objDto={objDto} />;
    case 'stack':
      return <StackVisual heapId={heapId} objDto={objDto} />;
    case 'queue':
    case 'deque':
      return <QueueVisual heapId={heapId} objDto={objDto} />;
    case 'list':
    case 'set':
      return <CollectionVisual heapId={heapId} objDto={objDto} />;
    case 'map':
      return <MapVisual heapId={heapId} objDto={objDto} />;
    case 'string_builder':
      return <StringBuilderVisual heapId={heapId} objDto={objDto} />;
    case 'string':
      return <StringVisual heapId={heapId} objDto={objDto} />;
    case 'primitive_wrapper':
      return <PrimitiveWrapperVisual heapId={heapId} objDto={objDto} />;
    case 'object':
    default:
      return <GenericObjectVisual heapId={heapId} objDto={objDto} />;
  }
}
