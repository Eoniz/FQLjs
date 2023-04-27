import axios from "axios";
import { fql } from '../../lib/FQL';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: Array<string>;
}

interface ProductResponse {
  products: Array<Product>;
}

const main = async () => {
  const results = await axios.get<ProductResponse>(`https://dummyjson.com/products`);
  const query = `category = "smartphone" and price <= 500`;

  const startDate = new Date();

  const filteredResults = fql(results.data.products, query);

  const endDate = new Date();
  const durationInMs = endDate.valueOf() - startDate.valueOf();

  console.log(filteredResults);
  console.log(`Filtered ${results.data.products.length} items to ${filteredResults.length} items in ${durationInMs}ms`);
}

main();
