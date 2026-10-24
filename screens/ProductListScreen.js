import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { getProducts, searchProducts } from '../api';

const PAGE_SIZE = 20;

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  // Wait 400ms after the user stops typing before searching
  useEffect(() => {
    const id = setTimeout(() => setTerm(input.trim()), 400);
    return () => clearTimeout(id);
  }, [input]);

  const load = useCallback(
    async (skip = 0, mode = 'initial') => {
      const id = ++requestId.current; // lets us ignore stale responses
      if (mode === 'initial') setLoading(true);
      if (mode === 'more') setLoadingMore(true);
      if (mode === 'refresh') setRefreshing(true);
      setError(null);
      try {
        const data = term
          ? await searchProducts(term, PAGE_SIZE, skip)
          : await getProducts(PAGE_SIZE, skip);
        if (id !== requestId.current) return;
        setTotal(data.total);
        setProducts((prev) =>
          skip === 0 ? data.products : [...prev, ...data.products]
        );
      } catch (e) {
        if (id !== requestId.current) return;
        setError(e.message || 'Something went wrong');
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [term]
  );

  // Runs on first load and whenever the search term changes
  useEffect(() => {
    load(0, 'initial');
  }, [load]);

  const loadMore = () => {
    if (loading || loadingMore || error) return;
    if (products.length >= total) return;
    load(products.length, 'more');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderBody = () => {
    if (loading) {
      return <ActivityIndicator size="large" style={styles.center} />;
    }
    if (error && products.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load(0, 'initial')}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={() => load(0, 'refresh')}
        ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} />
          ) : error ? (
            <TouchableOpacity onPress={() => load(products.length, 'more')}>
              <Text style={styles.footerError}>Couldn't load more. Tap to retry.</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search products"
        value={input}
        onChangeText={setInput}
        autoCorrect={false}
      />
      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 12 },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 12,
  },
  center: { marginTop: 48, alignItems: 'center' },
  card: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  thumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#f2f2f2' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  category: { fontSize: 12, color: '#888', marginTop: 2 },
  price: { fontSize: 15, color: '#4f46e5', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 32 },
  footer: { marginVertical: 16 },
  footerError: { textAlign: 'center', color: '#dc2626', marginVertical: 16 },
  errorText: { color: '#dc2626', marginBottom: 12 },
  retryBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});