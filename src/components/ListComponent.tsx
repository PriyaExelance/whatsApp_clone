import React from 'react';
import { FlatList, View, Text, StyleSheet, FlatListProps } from 'react-native';

interface ListComponentProps<T> extends Partial<FlatListProps<T>> {
  data?: T[];
  renderItem?: (info: { item: T; index: number }) => React.ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  ListEmptyComponent?: any;
  ItemSeparatorComponent?: boolean | any;
  horizontal?: boolean;
}

const ListComponent = <T extends { id?: string }>({
  data = [],
  renderItem,
  keyExtractor = (item, index) => (item.id ? item.id : index.toString()),
  ListEmptyComponent,
  ItemSeparatorComponent,
  horizontal = false,
  ...restProps
}: ListComponentProps<T>) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      horizontal={horizontal}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default ListComponent;
